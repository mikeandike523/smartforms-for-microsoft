import StateManager from '../../AppUtils/StateManager.js'

import CenteredContent from '../Templates/CenteredContent.js'

import {useNavigate, Link} from 'react-router-dom'
import { useEffect } from 'react'

function Signin(){

    return (
        <CenteredContent isAuthenticated={false}>
            <h1>SmartSummaries For Excel Online</h1>
            <h3>Sign into your account.</h3>
            <div>
                <label>Email:<input type="text" className="w3-input"/></label>
                <label>Password:<input type="password" className="w3-input"/></label>
            </div>
            <button type="button" className="w3-btn w3-green">Sign In</button>
            <h5>No Account?&nbsp;<Link to="/signup" className='w3-text-blue'>Sign Up</Link></h5>
            
        </CenteredContent>
    );
}

export default Signin;