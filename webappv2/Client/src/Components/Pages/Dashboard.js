import StateManager from '../../AppUtils/StateManager.js'

import CenteredContent from '../Templates/CenteredContent.js'

import MSALLogoutHelper from '../../AppUtils/MSALLogoutHelper.js'

import SpreadsheetList from '../Templates/SpreadsheetList.jsx'

import { useEffect, useState } from 'react'

import { useNavigate } from 'react-router-dom'

import useModal from '../Templates/Modal.js'

import axios from 'axios'
import FilePicker from '../Templates/FilePicker.js'

import '../Styling/spinner.css'

function Dashboard() {

    var [modal_content, modalOpen, modalClose] = useModal()

    const handleDisconnectAccount = async (e) => {

        const connectionId = e.target.dataset.connectionid

        const loginInfo = (await axios.post("http://localhost:8081/api/disconnect-account", { jwt: StateManager.query.exact(["jwt"]), connectionId: connectionId })).data

        var helper = new MSALLogoutHelper(loginInfo)

        await helper.prepare()
        await helper.finalize()

        window.location.reload()

    }

    const handleReconnectAccount = async (e) => {

        const connectionId = e.target.dataset.connectionid
        const login_url = (await axios.post('http://localhost:8081/auth0/signin', { jwt: StateManager.query.exact(["jwt"]), connectedAccountId: connectionId }, { withCredentials: true })).data
        window.location = login_url

    }

    const handleConnectAccount = async () => {

        const login_url = (await axios.post('http://localhost:8081/auth0/signin', { jwt: StateManager.query.exact(["jwt"]) }, { withCredentials: true })).data
        window.location = login_url

    }

    const handleConnectSpreadsheet = async (id) => {
        modalOpen({ title: 'Connect Spreadsheet', body: (<FilePicker handlePickFile={handlePickFile} id={id} path="/" />) })
    }

    const handlePickFile = async (filePath, id) => {

        modalClose()

        modalOpen({
            "title": "Action in progress...", "body": (
                <div>
                    Connecting spreadsheet <i>{filePath}</i>...
                    <div className="loader"></div>
                </div>
            )
        })

        const response = (await axios.post("http://localhost:8081/api/connect-spreadsheet", { jwt: StateManager.query.exact(['jwt']), path: filePath, connectedAccountId: id })).data

        if (response.status === "success") {
            modalClose()
            console.log("Spreadsheet successfully connected.")
            window.location.reload()
        }

        else {

            console.log(response.data)

            modalClose()

            if (response.code === "spreadsheet_already_connected") {
                modalOpen({
                    "title": "Spreadsheet Already Connected", "body": (
                        <div>
                            {response.data}
                        </div>
                    )
                })
            }
            else {
                modalOpen({
                    "title": "Error Connecting Spreadsheet", "body": (
                        <div>
                            Error connecting spreadsheet <i>{filePath}</i>.<br />Please try again later or contact the support team.
                        </div>
                    )
                })
            }

        }



    }

    const [connectedAccounts, setConnectedAccounts] = useState([])

    const [spreadsheetLists, setSpreadsheetLists] = useState({})


    useEffect(() => {

        (async () => {

            window.axios = axios

            const result = (await axios.post('http://localhost:8081/api/associate-latest-token', { jwt: StateManager.query.exact(["jwt"]) }, { withCredentials: true })).data

            var connectedAccountsResult = (await axios.post('http://localhost:8081/api/connected-accounts', { jwt: StateManager.query.exact(["jwt"]) }, { withCredentials: true })).data

            if (connectedAccountsResult.status === "success") {
                setConnectedAccounts(connectedAccountsResult.data)
            } else {
                setConnectedAccounts([])
            }

            for (var i = 0; i < connectedAccountsResult.data.length; i++) {
                var spreadsheetListsObj = {}
                Object.assign(spreadsheetListsObj, spreadsheetListsObj)
                var spreadsheetList = (await axios.post('http://localhost:8081/api/list-spreadsheets', { jwt: StateManager.query.exact(["jwt"]), connectedAccount: connectedAccountsResult.data[i].id })).data
                if (spreadsheetList.status === "success") {
                    spreadsheetList = spreadsheetList.data
                    console.log(spreadsheetList)
                    spreadsheetListsObj[connectedAccountsResult.data[i].id] = spreadsheetList
                    setSpreadsheetLists(spreadsheetListsObj)
                }
            }

        })()

    }, [])

    return (

        <>
            <CenteredContent isAuthenticated={true}>

                <h3>SmartSummaries Dashboard</h3>

                <h5>Connected Accounts</h5>

                {
                    connectedAccounts.length == 0 ?
                        (

                            <>
                                <table>
                                    <tbody>
                                        <tr>
                                            <td>
                                                <span>No connected accounts.&nbsp;<span className="w3-btn" style={{ textDecoration: "underline" }} onClick={handleConnectAccount}>Connect Account</span></span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>

                            </>

                        ) : (

                            <>
                                <table className="w3-table w3-striped">
                                    <thead>
                                        <tr>
                                            <td>Name</td>
                                            <td>Email</td>
                                            <td>Organization Name</td>
                                            <td>Connection Health</td>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            (() => {
                                                var entry_idx = -1
                                                function entry(userFullName, userMicrosoftEmail, tennantFullName, connectionHealth, id) {
                                                    entry_idx++
                                                    return (<><tr key={`account_${entry_idx}`} className={
                                                        entry_idx % 2 == 0 ? 'w3-sand' : 'w3-aqua'
                                                    }><td>{userFullName}</td><td>{userMicrosoftEmail}</td><td>{tennantFullName}</td><td>{(<span>{connectionHealth}&nbsp;<span onClick={handleDisconnectAccount} data-connectionid={id} style={{ textDecoration: "underline", cursor: "pointer", userSelect: "none" }} className="w3-text-red">(disconnect)</span>&nbsp;<span onClick={handleReconnectAccount} data-connectionid={id} style={{ textDecoration: "underline", cursor: "pointer", userSelect: "none" }} className="w3-text-blue">(reconnect)</span></span>)
                                                    }</td></tr>

                                                        {(connectionHealth === "alive") && (
                                                            <tr className={
                                                                entry_idx % 2 == 0 ? 'w3-sand' : 'w3-aqua'
                                                            }>
                                                                <td colSpan='4'>
                                                                    <SpreadsheetList items={spreadsheetLists[id] ?? []} handleConnectSpreadsheet={(e) => handleConnectSpreadsheet(id)} />
                                                                </td>
                                                            </tr>)}

                                                    </>)
                                                }
                                                var entries = []
                                                for (var i = 0; i < connectedAccounts.length; i++) {
                                                    var account = connectedAccounts[i]
                                                    entries.push(entry(account.userFullName, account.microsoftEmail, account.organizationName, account.health, account.id))
                                                }
                                                return entries
                                            })()
                                        }
                                    </tbody>
                                </table>
                                <div className='w3-text-center'>
                                    <span className="w3-btn" style={{ textDecoration: "underline" }} onClick={handleConnectAccount}>Connect Another Account</span>
                                </div>
                            </>

                        )}

            </CenteredContent>
            {modal_content}
        </>
    );

}

export default Dashboard;