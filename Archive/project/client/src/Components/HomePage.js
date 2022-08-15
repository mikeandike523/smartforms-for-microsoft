import {useEffect} from 'react'
import {useNavigate} from 'react-router-dom'

function HomePage(props) {

    const navigate = useNavigate()

    useEffect(()=>{
        if(props.isAuthenticated===false){
            navigate('/login',{replace:true});
        }
    })

    return props.isAuthenticated ? (<div><h1>SmartForms Dashboard</h1></div>) : (<div><h3>Redirecting to login page...</h3></div>);
}

export default HomePage;