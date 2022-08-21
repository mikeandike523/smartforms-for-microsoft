import Default from './Pages/Default.js'
import Dashboard from './Pages/Dashboard.js'
import Signin from './Pages/Signin.js'
import Signup from './Pages/Signup.js'

import DBManager from '../AppUtils/DBManager.js'

import {BrowserRouter, Routes, Route} from 'react-router-dom'
import { useEffect } from 'react'

function Router(){

    useEffect(()=>{

        if(window.db === undefined){
            window.db = new DBManager();
        }

    })

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Default />}/>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/signin" element={<Signin />} />
                <Route path="/signup" element={<Signup />} />
            </Routes>
        </BrowserRouter>
    );

}

export default Router;