import 'w3-css/w3.css'

import { Link } from 'react-router-dom'

function PageWithVHCenteredContent(props){

    return (

    <>
        <div style={{
            width: "100%", height: "100%", display: "flex", flexDirection: "row", alignItems:"center", justifyContent: "center"
        }}>

            <div style = {{
                display: "flex", flexDirection: "column", alignItems: "center", flexWrap: "nowrap"
            }}>

                {props.children}

            </div>

        </div>
    { 
    props.isAuthenticated
    ?
    (
        <div style={{position:"absolute", width: "100%", height:"4em"}}
            className="w3-bar w3-blue"
            >
                <div className="w3-bar-item w3-center">SmartSummaries For Excel</div>
                <Link to="/">
                <button type="button" className="w3-bar-item w3-button w3-yellow">Dashboard</button>
                </Link>
                <Link to="/logout">
                <button type="button" className="w3-bar-item w3-button w3-yellow">Sign Out</button>
                </Link>
        </div>
    )
    :
    (

        <div style={{position:"absolute", width: "100%", height:"4em"}}
            className="w3-bar w3-blue"
            >
                <div className="w3-bar-item w3-center">SmartSummaries For Excel</div>
        </div>

    )
    } 

    </>
    );

}

export default PageWithVHCenteredContent;