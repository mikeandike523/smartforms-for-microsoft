import 'w3-css/w3.css'

import { Link, useNavigate } from 'react-router-dom'

import useModal from '../Templates/Modal.js'

import StateManager from '../../AppUtils/StateManager.js'

function PageWithCenteredContent(props){

    const navigate = useNavigate()

    const [modal_content, modalOpen, modalClose] = useModal()

    const handleSignout = () =>{
        StateManager.upsert.exact(["jwt"],null)
        navigate('/default',{replace:true})
    }

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

                    <button type="button" className="w3-bar-item w3-button w3-yellow" onClick={handleSignout}>Sign Out</button>

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

        {modal_content}

    </>
    );

}

export default PageWithCenteredContent;