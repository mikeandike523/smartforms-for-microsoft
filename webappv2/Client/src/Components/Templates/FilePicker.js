import StateManager from "../../AppUtils/StateManager.js"
import axios from 'axios'
import {useEffect, useState} from 'react'

function FilePicker(props){

    const jwt = StateManager.query.exact(["jwt"])

    const connectedAccountId = props.id

    const path = props.path

    var [response, setResponse] = useState(null)

    useEffect(()=>{

        (async ()=>{

            const r = (await axios.post('http://localhost:8081/api/file-picker/list',{jwt:jwt,path:path,connectedAccountId:connectedAccountId}))

            setResponse(r)

        })()


    },[])

    return <>
    
        {response&&JSON.stringify(response)}
        {response&&response.data&&JSON.stringify(response.data)}
    </>

}

export default FilePicker