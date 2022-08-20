import StateManager from '../../AppUtils/StateManager.js'

import CenteredContent from '../Templates/CenteredContent.js'

import {useNavigate} from 'react-router-dom'
import { useEffect } from 'react'

function Dashboard(){

    return (
        <CenteredContent isAuthenticated={true}>
            <h1>SmartSummaries Dashboard (Under Construction)</h1>
        </CenteredContent>
    );
}

export default Dashboard;