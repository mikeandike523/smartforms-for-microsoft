import StateManager from '../../AppUtils/StateManager.js'
import CenteredContent from '../Templates/CenteredContent.js'
import useModal from '../Templates/Modal'
import {Link, useNavigate} from 'react-router-dom'
import { useEffect } from 'react'
import { useState} from 'react'
import axios from 'axios'

function Signup(){

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [cpassword, setCPassword] = useState("")

    const [modal_content, modalOpen, modalClose] = useModal()

    const signup_submit = async () => {

        if((!email??"".trim()) || (!password??"".trim()) || (!cpassword??"".trim())){
            modalOpen({
                title:"Invalid Signup",
                body:"Email, password, or confirm-password is blank."
            })
            return;
        }

        if(password!=cpassword){
            modalOpen({
                title:"Invalid Signup",
                body:"Password and confirm-password do not match."
            })
            return;
        }

        const response = (await axios.post("/auth/signup",{

            email: email,
            password: password,
            cpassword: cpassword

        })).data// Assume server does not crash

        if(response.status === "success"){
            modalOpen({
                title:"Success",
                body:(

                    <h5>Signup successful.&nbsp;<Link to="/signin" style={{textDecoration:"underline",cursor:"pointer",userSelect:"none"}}>Sign In</Link></h5>
                    
                )
            })
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
            <h3>Sign up for a new account.</h3>
            <div>
                <label>Email:<input type="text" className="w3-input" onChange={
                    (event) => {
                        setEmail(event.target.value)
                    }
                }/></label>
                <label>Password:<input type="password" className="w3-input" onChange={
                    (event) => {
                        setPassword(event.target.value)
                    }
                }/></label>
                <label>Confirm Password:<input type="password" className="w3-input" onChange={
                    (event) => {
                        setCPassword(event.target.value)
                    }
                }/></label>
            </div>
            <button type="button" className="w3-btn w3-green" onClick={signup_submit}>Sign Up</button>
        </CenteredContent>
        {modal_content}
        </>
    );
}

export default Signup;