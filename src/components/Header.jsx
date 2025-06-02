import React, { useEffect, useState }  from 'react'
import { Link } from 'react-router-dom'
import logo from '../assets/KGABP.png'



const Header = ({user, isAdmin}) => {
  
   
  return (
    <header className="bg-white shadow-md py-4 px-6 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <img src={logo} alt="KGA Brune Park Logo" className="w-16 h-16" />
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
          KGA Brune Park Absence Reporting
        </h1>
      </div>
      <div className="flex space-x-4">
        <Link to="/form">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition">
            Absence Request Form
          </button>
        </Link>
        <Link to="/userabsence">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition">
             {`${user.name}'s Absence Requests`}
          </button>
        </Link>
        {isAdmin && <Link to="/AdminAbsence">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition">
            All Requests
          </button>
        </Link>}
        <Link to="/login">
          <button className="bg-gray-700 hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-lg transition">
            {user ? `Welcolme ${user.name}` : 'Login'}
          </button>
        </Link>
      </div>
    </header>
  )
}

export default Header
