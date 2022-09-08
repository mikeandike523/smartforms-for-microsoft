import StateManager from '../../AppUtils/StateManager.js'

import CenteredContent from '../Templates/CenteredContent.js'

import MSALLogoutHelper from '../../AppUtils/MSALLogoutHelper.js'

import SpreadsheetList from '../Templates/SpreadsheetList.js'

import { useEffect, useState } from 'react'

import useModal from '../Templates/Modal.js'

import axios from 'axios'
import FilePicker from '../Templates/FilePicker.js'

function Dashboard(){

    var [modal_content,modalOpen,modalClose]=useModal()

    const handleDisconnectAccount = async (e) => {

        const connectionId = e.target.connectionid

        // @TODO: Is it safe to expose microsoft homeAccountId on the client/browser side?
        const loginInfo = (await axios.post("http://localhost:8081/api/disconnect-account",{jwt:StateManager.query.exact(["jwt"]),connectionId:connectionId})).data

        var helper = new MSALLogoutHelper(loginInfo)
        // helper.redirect() // @TODO: rename to popup()

        // @TODO: When deploy to https:// website, can work with postlogoutRedirectUrl to provide a smooth user experience that will refresh page/connected accounts list after microsoft signout completed. For now, simply delete access/refresh token from mongodb database. The express-session session should have already been destroyed on sign-in (i.e., /api/associateLatestToken)

        await helper.prepare()
        await helper.finalize()

        window.location.reload()

    }

    const handleConnectAccount = async () => {

        const login_url = (await axios.post('http://localhost:8081/auth0/signin',{jwt:StateManager.query.exact(["jwt"])},{withCredentials:true})).data
        window.location = login_url
        
    }

    const handleConnectSpreadsheet = async (id) => {
        modalOpen({title:'Connect Spreadsheet',body:(<FilePicker id={id} path="/"/>)})
    }

    const [connectedAccounts, setConnectedAccounts] = useState([])

    const [spreadsheetLists,setSpreadsheetLists] = useState({})


    useEffect(()=>{

        (async () => {

            // const helper = new MSALLogoutHelper({})
            // await helper.finalize()

            const result = (await axios.post('http://localhost:8081/api/associate-latest-token',{jwt:StateManager.query.exact(["jwt"])},{withCredentials:true})).data // Idempotent operation

            var connectedAccountsResult = (await axios.post('http://localhost:8081/api/connected-accounts',{jwt:StateManager.query.exact(["jwt"])},{withCredentials:true})).data

            console.log(connectedAccountsResult)

            if(connectedAccountsResult.status==="success"){
                setConnectedAccounts(connectedAccountsResult.data)
            }else{
                setConnectedAccounts([])
            }

            for(var i=0; i<connectedAccountsResult.data.length; i++){
                var spreadsheetListsObj = {}
                Object.assign(spreadsheetListsObj,spreadsheetListsObj)
                var spreadsheetList = await (axios.post('http://localhost:8081/api/list-spreadsheets',{jwt:StateManager.query.exact(["jwt"])})).data
                spreadsheetListsObj[connectedAccountsResult.data[i].id] = spreadsheetList
                setSpreadsheetLists(spreadsheetListsObj)
            }

        })()
        
    },[])

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
                                <span>No connected accounts.&nbsp;<span className="w3-btn" style={{textDecoration:"underline"}} onClick={handleConnectAccount}>Connect Account</span></span>
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
                            (()=>{
                                var entry_idx = -1
                                function entry (userFullName,userMicrosoftEmail,tennantFullName,connectionHealth,id){
                                    entry_idx++
                                    return (<><tr key={`account_${entry_idx}`}><td>{userFullName}</td><td>{userMicrosoftEmail}</td><td>{tennantFullName}</td><td>{(<span>{connectionHealth}&nbsp;<span onClick={handleDisconnectAccount} connectionid={id}  style={{textDecoration:"underline",cursor:"pointer",userSelect:"none"}} className="w3-text-red">(disconnect)</span></span>)
                                    }</td></tr>
                                    <tr>
                                        <td colspan='4'>
                                    <SpreadsheetList items={spreadsheetLists[id]??[]} handleConnectSpreadsheet={(e)=>handleConnectSpreadsheet(id)}/>
                                        </td>
                                    </tr></>)
                                }
                                var entries = []
                                for(var i=0; i<connectedAccounts.length; i++){
                                    var account = connectedAccounts[i]
                                    entries.push(entry(account.userFullName,account.microsoftEmail,account.organizationName,account.health))
                                }
                                return entries
                            })()
                        }
                    </tbody>
                </table>
                <div class='w3-text-center'>
                    <span className="w3-btn" style={{textDecoration:"underline"}} onClick={handleConnectAccount}>Connect Another Account</span>
                </div>
            </>
            
            )}

        </CenteredContent>
        {modal_content}
        </>
    );

}

export default Dashboard;