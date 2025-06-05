import React from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../assets/KGABP.png'

const Fail = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#CAF0F8] px-4">
      <div className="bg-white shadow-xl rounded-xl p-8 max-w-md w-full text-center">
        <img src={logo} alt="KGA Brune Park Logo" className="w-20 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-[#03045E] mb-2">Oops! Something went wrong</h1>
        <p className="text-[#0077B6] mb-6">
          We couldn’t complete your login. Please try again.
        </p>
        <button
          onClick={() => navigate('/')}
          className="w-full bg-[#90E0EF] hover:bg-[#ADE8F4] text-[#03045E] font-semibold py-2 px-4 rounded-lg transition duration-200"
        >
          Return to Home
        </button>
      </div>
    </div>
  )
}

export default Fail
