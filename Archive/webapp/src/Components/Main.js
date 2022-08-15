import {useState, useEffect, React, useImperativeHandle} from 'react'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import axios from 'axios'

import LoginPage from "./LoginPage.js"
import LogoutPage from "./LogoutPage.js"
import DefaultPage from './DefaultPage.js'
import Dashboard from './Dashboard.js'

function Main(){

    return (

        <BrowserRouter>
            <Routes>
                <Route path="/" element={<DefaultPage />} />
                <Route path="/dasboard" element={<Dashboard />} />
                <Route path="/login" element={<LoginPage/>} />
                <Route path="/logout" element={<LogoutPage/>} />
            </Routes>
        </BrowserRouter>

    );

}

export default Main;