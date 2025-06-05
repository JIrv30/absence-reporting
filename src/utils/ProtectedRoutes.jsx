import React, { useEffect, useState } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { getUser } from '../appwrite/auth'

const ProtectedRoutes = () => {
  
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    const checkUser = async () => {
      try {
        const userData = await getUser()
        setUser(userData)
      } catch (error) {
        setUser(null)
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    checkUser()
  },[])

  if (loading) return <p>Loading...</p>
  
  return (
    user ? <Outlet /> : <Navigate to='/' />
  )
}

export default ProtectedRoutes