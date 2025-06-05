import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/KGABP.png';
import { loginWithGoogle, logOutUser } from '../appwrite/auth';

const Header = ({ user, teamLeader }) => {
  const handleLogout = async () => {
    await logOutUser();
    window.location.reload(); // Or use navigation to redirect
  };

  const handleLogin = async () => {
    await loginWithGoogle()
    
  }

  return (
    <header className="bg-[#CAF0F8] shadow-md px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <img src={logo} alt="KGA Brune Park Logo" className="w-12 h-12" />
          <h1 className="text-2xl font-bold text-[#03045E]">
            KGA Brune Park Absence
          </h1>
        </div>

        <nav className="flex flex-wrap items-center gap-3">
          <Link to="/form">
            <button className="bg-[#00B4D8] hover:bg-[#48CAE4] text-white font-medium py-2 px-4 rounded-lg transition">
              Request Form
            </button>
          </Link>

          {user && (
            <Link to="/userabsence">
              <button className="bg-[#0077B6] hover:bg-[#0096C7] text-white font-medium py-2 px-4 rounded-lg transition">
                {`${user.name}'s Requests`}
              </button>
            </Link>
          )}

          {teamLeader && (
            <Link to={teamLeader === 'Admin' ? '/Adminabsence' : '/Teamabsence'}>
              <button className="bg-[#023E8A] hover:bg-[#0077B6] text-white font-medium py-2 px-4 rounded-lg transition">
                {teamLeader === 'Admin' ? 'All Requests' : 'Team Requests'}
              </button>
            </Link>
          )}

          {user ? (
            <button
              onClick={handleLogout}
              className="bg-[#03045E] hover:bg-[#023E8A] text-white font-medium py-2 px-4 rounded-lg transition"
            >
              Logout
            </button>
          ) : (
              <button
              onClick={handleLogin}
              className="bg-[#90E0EF] hover:bg-[#ADE8F4] text-[#03045E] font-medium py-2 px-4 rounded-lg transition">
                Login
              </button>
            
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
