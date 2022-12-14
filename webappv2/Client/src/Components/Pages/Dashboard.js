import StateManager from '../../AppUtils/StateManager.js'

import CenteredContent from '../Templates/CenteredContent.js'

import { useEffect, useState } from 'react'

import axios from 'axios'

function Dashboard(){

    const handleConnectAccount = async () => {

        const login_url = (await axios.post('http://localhost:8081/auth0/signin',{jwt:StateManager.query.exact(["jwt"])},{withCredentials:true})).data
        window.location = login_url

    }

    const [connectedAccounts, setConnectedAccounts] = useState([])

    useEffect(()=>{

        (async () => {

            const result = (await axios.post('http://localhost:8081/api/associate-latest-token',{jwt:StateManager.query.exact(["jwt"])},{withCredentials:true})).data // Idempotent operation

            var connectedAccountsResult = (await axios.post('http://localhost:8081/api/connected-accounts',{jwt:StateManager.query.exact(["jwt"])},{withCredentials:true})).data
            if(connectedAccountsResult.status==="success"){
                setConnectedAccounts(connectedAccountsResult.data)
            }else{
                setConnectedAccounts([])
            }

        })()
        
    },[])

    return (

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
                                function entry (userFullName,userMicrosoftEmail,tennantFullName,connectionHealth){
                                    entry_idx++
                                    return (<tr key={`account_${entry_idx}`}><td>{userFullName}</td><td>{userMicrosoftEmail}</td><td>{tennantFullName}</td><td>{connectionHealth
                                    !=="dead" ? connectionHealth : (<span>dead&nbsp;<span style={{textDecoration:"underline",cursor:"pointer",userSelect:"none"}} className="w3-text-red">(disconnect)</span></span>)
                                    }</td></tr>)
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
            </>
            
            )}

        </CenteredContent>

    );

}

export default Dashboard;