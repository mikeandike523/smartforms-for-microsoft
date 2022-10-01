import { useParams } from 'react-router-dom'
import axios from 'axios'
import { useEffect, useState } from 'react'
import CenteredContent from '../Templates/CenteredContent.js'


function EndUserFacing(props) {

    const { spreadsheetid } = useParams()

    const [hasInitialized, setHasInitialized] = useState(false)


    useEffect(() => {
        (async () => {

            if (!hasInitialized) {
                const response = (await axios.get("http://localhost:8081/enduserfacing-api/start/" + spreadsheetid)).data
                if (response.status === "success") {
                    console.log(response.data)
                    setHasInitialized(true);
                }
            }

        })()
    })

    return <>

        {
            hasInitialized ? (<>Loaded</>) : (<>Loading...</>)
        }

    </>
}

export default EndUserFacing;