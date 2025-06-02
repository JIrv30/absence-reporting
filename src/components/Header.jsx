import React, { useEffect, useState }  from 'react'
import { Link } from 'react-router-dom'
import logo from '../assets/KGABP.png'
import db from '../appwrite/databases';
import { getUser, teams } from '../appwrite/auth';

const Header = () => {
  const [user, setUser] = useState(null);
  const [absence, setAbsence] = useState([]);
  const [loading, setLoading] = useState(true);
  const ADMIN_TEAM_ID = import.meta.env.VITE_ADMIN_TEAM_ID

  useEffect(() => {
    const init = async () => {
      try {
        const userData = await getUser();
        setUser(userData);
        const isUserAdmin = async () => {
          const memberships = await teams.listMemberships(ADMIN_TEAM_ID)
        }

        
      } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  useEffect(()=>{console.log(user)},[user])
  
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
            Absence Requests
          </button>
        </Link>
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
