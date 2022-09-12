import StateManager from "../../AppUtils/StateManager.js"
import axios from 'axios'
import { useEffect, useState } from 'react'
import { fusePathComponents, getPathComponents } from "../../AppUtils/PathManagement.js"

function FilePicker(props) {

    const jwt = StateManager.query.exact(["jwt"])

    const connectedAccountId = props.id

    const [path, setPath] = useState(props.path)

    const components = getPathComponents(path)

    var [response, setResponse] = useState({ data: [] })

    useEffect(() => {


        (async () => {

            const r = (await axios.post('http://localhost:8081/api/file-picker/list', { jwt: jwt, path: path, connectedAccountId: connectedAccountId })).data

            setResponse(r)

        })()


    }, [path])

    var entries = []

    const handleClick = (isFolder, name) => {

        var components = getPathComponents(path)

        if (isFolder) {
            components.push(name)
            setPath(fusePathComponents(components))
        } else {
            components.push(name)
            var filePath = fusePathComponents(components)
            props.handlePickFile(filePath, props.id)
        }

    }

    const handleDirectoryUpButtonClick = (e) => {
        var components = getPathComponents(path)
        components.pop()
        setPath(fusePathComponents(components))
    }

    for (var i = 0; i < response.data.length; i++) {
        const data = response.data[i]
        entries.push(
            <div key={"filepicker_" + connectedAccountId + "_item_" + i} className='w3-bar' onClick={(e) => {
                if (e.detail !== 2) {
                    e.stopPropagation()
                    return
                }
                handleClick(data.isFolder, data.name)
            }} >
                <div className='w3-bar-item w3-btn'>
                    <span className={"fa fa-" + (response.data[i].isFolder ? "folder" : "file")}></span>&nbsp;
                    <span>{response.data[i].name}</span>
                </div>
            </div>
        )
    }

    return <>

        <div class='w3-bar'>{components.length > 0 && (<div className='w3-bar-item' style={{ cursor: 'pointer', userSelect: 'none' }} onClick={handleDirectoryUpButtonClick}>Folder ^^</div>)}</div>
        {entries}

    </>

}

export default FilePicker