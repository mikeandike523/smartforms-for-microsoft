import StateManager from "../../AppUtils/StateManager.js"
import axios from 'axios'
import {useEffect, useState} from 'react'
import {getPathComponents} from "../../AppUtils/PathManagement.js"

function FilePicker(props){

    const jwt = StateManager.query.exact(["jwt"])

    const connectedAccountId = props.id

    const path = props.path

    const components = getPathComponents(path)

    var [response, setResponse] = useState({data:[]})

    useEffect(()=>{

        (async ()=>{

            const r = (await axios.post('http://localhost:8081/api/file-picker/list',{jwt:jwt,path:path,connectedAccountId:connectedAccountId})).data

            setResponse(r)

        })()


    },[])

    var entries = []

    console.log(response.data.length+"\n"+JSON.stringify(response.data))

    for(var i=0; i< response.data.length; i++){
        entries.push(
            <div key={"filepicker_"+connectedAccountId+"_item_"+i} className='w3-bar'>
                <div className='w3-bar-item w3-btn'>
                    <span className={"fa fa-"+(response.data[i].isFolder ? "folder" : "file")}></span>&nbsp;
                    <span>{response.data[i].name}</span>
                </div>
            </div>
        )
    }

    return <>

        <div class='w3-bar'>{components.length===0&&(<span class='fa fa-folder-arrow-up'></span>)}</div>
        {entries}

    </>

}

export default FilePicker