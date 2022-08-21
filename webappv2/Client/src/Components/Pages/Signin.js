import StateManager from '../../AppUtils/StateManager.js'

import CenteredContent from '../Templates/CenteredContent.js'

import useModal from '../Templates/Modal.js'

import {useNavigate, Link} from 'react-router-dom'
import { useState, useEffect } from 'react'
import axios from 'axios'

function Signin(){

    const [modal_content, modalOpen, modalClose] = useModal()

    const [email, setEmail] = useState("")

    const [password, setPassword] = useState("")
 
    const handleSignIn = async () =>{

        if((!email??"".trim()) || (!password??"".trim())){
            modalOpen({
                title:"Invalid Signin",
                body:"Email or password is blank."
            })
            return;
        }

        const response = (await axios.post("/auth/signin",
            {
                email:email,
                password:password
            }
        )).data

        if(response.status==="success"){
            modalOpen({
                title:"Success",
                body:"Login successful."
            })
            StateManager.upsert.exact(["jwt"],response.data)
            console.log(StateManager.query.exact(["jwt"]))
        }else{
            modalOpen({
                title:"Error",
                body:response.data
            })
        }
    
    }



    return (
        <>
        <CenteredContent isAuthenticated={false}>
            <h1>SmartSummaries For Excel Online</h1>
            <h3>Sign into your account.</h3>
            <div>
                <label>Email:<input type="text" className="w3-input" onChange={(e)=>{setEmail(e.target.value)}}/></label>
                <label>Password:<input type="password" className="w3-input" onChange={(e)=>setPassword(e.target.value)}/></label>
            </div>
            <button type="button" className="w3-btn w3-green" onClick={handleSignIn}>Sign In</button>
            <h5>No Account?&nbsp;<Link to="/signup" className='w3-text-blue'>Sign Up</Link></h5>
            
        </CenteredContent>
        {modal_content}
        </>
            
    );
}

export default Signin;