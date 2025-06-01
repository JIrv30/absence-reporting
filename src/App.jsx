import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Header from './components/Header'
import Form from './components/Form'
import LoginPage from './pages/LoginPage'
import ProtectedRoutes from './utils/ProtectedRoutes'
import UserAbsence from './pages/UserAbsence'
import Home from './pages/Home' 
import OAuthCallback from './utils/OAuthCallback'
import Fail from './pages/Fail'

function App() {
  

  return (
    <>
      
        <BrowserRouter>
        <Header />
          <Routes>
            <Route element={<Home />} path='/' />
            <Route element={<LoginPage />} path='login' />
            <Route element={<ProtectedRoutes />}>
              <Route element={<UserAbsence />} path='/UserAbsence' />   
            <Route element={<Form />} path='/form' />
            </Route>
            
            <Route element={<Fail />} path='/fail' />
           
          </Routes>  
        </BrowserRouter>
    </>
  )
}

export default App
