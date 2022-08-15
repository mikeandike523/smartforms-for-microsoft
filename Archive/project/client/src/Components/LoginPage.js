import VHCenteredFlexboxWithNavbar from './VHCenteredFlexbox'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useMsal } from '@azure/msal-react'
import axios from 'axios'

import {loginRequest} from '../Auth/authConfig.js'

function LoginPage(props) {

    const navigate = useNavigate();

    const { instance } = useMsal();

    const loginButtonClicked = () => {
        instance.loginRedirect(loginRequest).catch(e=>console.error(e))
    }

    return (
        <VHCenteredFlexboxWithNavbar>
            <button type="button" onClick={loginButtonClicked}>Login</button>
        </VHCenteredFlexboxWithNavbar>
    )

}

export default LoginPage;