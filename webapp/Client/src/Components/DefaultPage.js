import PageWithVHCenteredContent from './PageWithVHCenteredContent'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axios from 'axios'

const StateManager = require('../Utils/StateManager.js')

function DefaultPage(props) {

    const navigate = useNavigate();

    useEffect(()=>{
    
        (async()=>{

            var isAuthenticated = StateManager.query.exact(["smartforms_auth_token"])

            if(isAuthenticated){
                navigate('/dashboard',{replace:true})
            }else{
                navigate('/login',{replace:true})
            }

        })()

    })

    return (
        <PageWithVHCenteredContent isAuthenticated={false}>
            
            <i>Loading...</i>
            
        </PageWithVHCenteredContent>
    )

}

export default DefaultPage;