import StateManager from '../../AppUtils/StateManager.js'

import CenteredContent from '../Templates/CenteredContent.js'

import {useNavigate} from 'react-router-dom'
import { useEffect } from 'react'

function Default(){

    const navigate = useNavigate()

    const isAuthenticated = StateManager.query.exact(["jwt"]) !== undefined

    useEffect(()=>{

        if(isAuthenticated){
            navigate("/dashboard",{replace:true})
        }
        else{
            navigate("/signin", {replace:true})
        }

    })

    return (
        <CenteredContent isAuthenticated={isAuthenticated}>
            <h1><i>Loading...</i></h1>
        </CenteredContent>
    );
}

export default Default;