import React, { useEffect } from 'react'
import { loginWithGoogle } from '../appwrite/auth'
import logo from '../assets/KGABP.png'
import { getUser } from '../appwrite/auth'
import { Navigate, useNavigate } from 'react-router-dom'

const Home = () => {
  const navigate = useNavigate()

  useEffect(()=>{
    const checkLogin = async () => {
      try {
        const user = await getUser()
        if(user) {
          navigate('userabsence')
        }
      } catch(error) {
        console.error(error)
      }
    }
    checkLogin()
  },[])

  const handleLogin = async () => {
    
    try {
      await loginWithGoogle()
    } catch (error) {
      console.error(error)
    }
    
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#CAF0F8] px-4">
      <div className="bg-white shadow-xl rounded-xl p-8 max-w-md w-full text-center">
        <img src={logo} alt="KGA Brune Park Logo" className="w-20 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-[#03045E] mb-2">Welcome to the Absence Reporting System</h1>
        <p className="text-[#0077B6] mb-6">
          Please sign in with your school Google account to continue.
        </p>
        <button
          onClick={handleLogin}
          className="w-full bg-[#90E0EF] hover:bg-[#ADE8F4] text-[#03045E] font-semibold py-2 px-4 rounded-lg transition duration-200"
        >
          Login with Google
        </button>
      </div>
    </div>
  )
}

export default Home
