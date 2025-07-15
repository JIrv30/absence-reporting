import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Header from './components/Header'
import Form from './components/Form'
import ProtectedRoutes from './utils/ProtectedRoutes'
import UserAbsence from './pages/UserAbsence'
import Home from './pages/Home' 
import Fail from './pages/Fail'
import AdminAbsence from './pages/AdminAbsence'
import { getUser } from './appwrite/auth'
import { teams } from './appwrite/config'
import TeamAbsenceRequest from './pages/TeamAbsenceRequest'


function App() {
  const [user, setUser] = useState(null)
  const [teamLeader, setTeamLeader] = useState(null)
  const [loading, setLoading] = useState(true)
  const teamIds = JSON.parse(import.meta.env.VITE_TEAM_ID_JSON)

  useEffect(()=>{
    const init = async () => {
      try {
        const userData = await getUser()
        if(!userData) {
          setUser(null)
          return
        }
        
        setUser(userData)

        
        const teamList = await teams.list()
        const teamLeaderId = teamList.teams[0].$id

        const value = teamIds[teamLeaderId]

        // console.log(value.toLowerCase())

        setTeamLeader(value.toLowerCase())

        
        
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
        <Header user={user} teamLeader={teamLeader} />
          <Routes>
            <Route element={<Home />} path='/' />
            <Route element={<ProtectedRoutes />}>
              <Route element={<UserAbsence user={user} />} path='/UserAbsence' />  
              <Route element={<AdminAbsence user={user} teamLeader={teamLeader} /> } path='/AdminAbsence' />
              <Route element={<TeamAbsenceRequest user={user} teamLeader={teamLeader} /> } path='/TeamAbsence' /> 
            <Route element={<Form user={user} teamLeader={teamLeader} />} path='/form' />
            </Route>
            
            <Route element={<Fail />} path='/fail' />
           
          </Routes>  
        </BrowserRouter>
    </>
  )
}

export default App
