import PageWithVHCenteredContent from './PageWithVHCenteredContent'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axios from 'axios'

function Dashboard(props) {

    return (
        <PageWithVHCenteredContent isAuthenticated={true}>
            <h1>SmartForms Dashboard</h1>
        </PageWithVHCenteredContent>
    )

}

export default Dashboard;