import { useEffect, useState } from 'react'
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
import AdminAbsence from './pages/AdminAbsence'
import { getUser } from './appwrite/auth'
import { teams } from './appwrite/config'

function App() {
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const ADMIN_TEAM_ID = import.meta.env.VITE_ADMIN_TEAM_ID

  useEffect(()=>{
    const init = async () => {
      try {
        const userData = await getUser()
        if(!userData) {
          setUser(null)
          return
        }
        
        setUser(userData)

        const memberships = await teams.listMemberships(ADMIN_TEAM_ID)
        const inAdminTeam = memberships.memberships.some((m)=>m.userId===userData.$id)
        setIsAdmin(inAdminTeam)
      } catch (error) {
        console.error('Error initialising app', error)
      } finally {
        setLoading(false)
      }
    }
    init()
  },[])

  if(loading) return <div>Loading App...</div>

  return (
    <>
      
        <BrowserRouter>
        <Header user={user} isAdmin={isAdmin} />
          <Routes>
            <Route element={<Home />} path='/' />
            <Route element={<LoginPage />} path='login' />
            <Route element={<ProtectedRoutes />}>
              <Route element={<UserAbsence user={user} isAdmin={isAdmin} />} path='/UserAbsence' />  
              <Route element={<AdminAbsence user={user} isAdmin={isAdmin} /> } path='/AdminAbsence' /> 
            <Route element={<Form user={user} isAdmin={isAdmin} />} path='/form' />
            </Route>
            
            <Route element={<Fail />} path='/fail' />
           
          </Routes>  
        </BrowserRouter>
    </>
  )
}

export default App
