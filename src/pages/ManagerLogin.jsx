// import React from 'react'

import axios from "axios";
import {  Navigate, useNavigate } from "react-router";
import { useState } from "react"
// import Dashboard from "./Dashboard";

export default function ManagerLogin() {
    const [email,setEmail] = useState('');
    const [password,setPassword] = useState ('')
    const navigate = useNavigate()

    const handleLogin = ((e) => {
        e.preventDefault();
        const userdata = { email, password };
            axios.post('http://localhost:5000/admin-login', userdata)
            .then(
              // alert('Manager is now logged in'),
              // <Navigate to='/dashboard' />
              // <button><Link to='/dashboard' /></button>,
              // <Route to='/dashboard' element={<Dashboard />} />
              navigate('/Dashboard')

            ) 
            .catch((err)=>{
              console.log('User failed to login back!',err)
    })
    });
  return (
    <div>
      <h5>Login As Manager here!</h5>
      <form onSubmit={handleLogin} style={{border : "1px solid green", width: "300px", height: "300px"}}>
        <input style={{marginTop:"120px"}} type="text" placeholder= " enter your email here" value={email} onChange={(e) => setEmail(e.target.value)} /> <br /><br />
        <input type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <br />
        <button type= "submit">Login</button>
        <Navigate to='/home'/>

      </form>
    </div>
  )
}
