import PageWithVHCenteredContent from './PageWithVHCenteredContent'
import { useNavigate, Link} from 'react-router-dom'
import { useState } from 'react'
import axios from 'axios'

import 'w3-css/w3.css'

function LoginPage(props) {

    const navigate = useNavigate();

    const loginButtonClicked = async () => {
        
        const auth0_login_page_url= (await axios.get("http://localhost:8081/auth/signin")).data
        
        window.location = auth0_login_page_url
        
    }

    return (
        <PageWithVHCenteredContent isAuthenticated={false}>
            <h1>SmartSummaries For Excel Online</h1>
            <h3>Email personalized summaries directly from online Excel spreadsheets!</h3>
            <button type="button" onClick={loginButtonClicked}
                className="w3-button w3-xxxlarge"
                >Login With Microsoft</button>
            <Link to="/logout">DEBUG: Go to Logout Page</Link>
        </PageWithVHCenteredContent>
    )

}

export default LoginPage;