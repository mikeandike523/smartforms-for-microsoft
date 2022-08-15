import VHCenteredFlexboxWithNavbar from './VHCenteredFlexbox'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useMsal } from '@azure/msal-react'
import axios from 'axios'

import {loginRequest} from '../Auth/authConfig.js'

function LoginPage(props) {

    const navigate = useNavigate();

    return (
        <VHCenteredFlexboxWithNavbar>
            <div>Under Construction</div>
        </VHCenteredFlexboxWithNavbar>
    )

}

export default LoginPage;