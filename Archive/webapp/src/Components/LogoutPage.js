import PageWithVHCenteredContent from './PageWithVHCenteredContent'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import axios from 'axios'

import 'w3-css/w3.css'

function LogoutPage(props) {

    const navigate = useNavigate();

    const logoutButtonClicked = async () => {
        
        const auth0_logout_page_url= (await axios.get("http://localhost:8081/auth/signout")).data
        
        window.location = auth0_logout_page_url
        
    }

    return (
        <PageWithVHCenteredContent isAuthenticated={true}>
            <h1>Logout from SmartSummaries?</h1>
            <button type="button" onClick={logoutButtonClicked}
                className="w3-button w3-xxxlarge"
                >Logout + Detach Microsoft Account</button>
        </PageWithVHCenteredContent>
    )

}

export default LogoutPage;