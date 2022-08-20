import 'w3-css/w3.css'

import { Link } from 'react-router-dom'

function PageWithCenteredContent(props){

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
    

        <div style={{position:"fixed", width: "100%", top:"0px", left:"0px"}}
            className="w3-blue w3-bar"
            >
                <div className="w3-bar-item">SmartSummaries For Excel Online</div>
                {
                props.isAuthenticated?(
                    <>

                    <Link to="/dashboard">
                    <button type="button" className="w3-bar-item w3-button w3-yellow">Dashboard</button>
                    </Link>
                    <Link to="/signout">
                    <button type="button" className="w3-bar-item w3-button w3-yellow">Sign Out</button>
                    </Link>
                    </>
                ) :
                (
                    <>
                    <Link to="/signin">
                    <button type="button" className="w3-bar-item w3-button w3-yellow">Sign In</button>
                    </Link>
                    <Link to="/signup">
                    <button type="button" className="w3-bar-item w3-button w3-yellow">Sign Up</button>
                    </Link>
                    </>
                )
                }
        </div>

    </>
    );

}

export default PageWithCenteredContent;