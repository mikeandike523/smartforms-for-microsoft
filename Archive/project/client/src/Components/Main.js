import {useState, useEffect, React, useImperativeHandle} from 'react'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import { useIsAuthenticated } from '@azure/msal-react'
import axios from 'axios'

import LoginPage from "./LoginPage.js"
import LogoutPage from "./LogoutPage.js"
import HomePage from './HomePage.js'

function Main(){
    
    Promise.resolve(

        async () => {

            await axios.get('http://localhost:8081/get-session') 

        }

    ).catch(console.error)

    const isAuthenticated = useIsAuthenticated()

    return (

        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage  isAuthenticated={isAuthenticated} />} />
                <Route path="/login" element={<LoginPage/>} />
                <Route path="/logout" element={<LogoutPage/>} />
            </Routes>
        </BrowserRouter>

    );

}

export default Main;