// src/components/Navbar.js
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

const Navbar = () => {
  const { user, role, setUser, setRole } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    setUser(null);
    setRole(null);
    navigate("/", { replace: true });
  };
  return (
    <nav className="navbar">
      <ul className="nav-links left">
        {!user && <li><Link to="/">Login</Link></li>}
      </ul>

      <div className="nav-logo">
        <img src="/logo.png" alt="Logo" />
      </div>

      <ul className="nav-links right">
        {user && role === 'worker' && (
          <li>
            <Link to="/dashboard-worker">Dashboard</Link>
          </li>
        )}
        {user && role === 'admin' && (
          <>
            <li>
              <Link to="/dashboard-admin">Dashboard</Link>
            </li>
            <li>
              <Link to="/user-management">Manage Users</Link>
            </li>
          </>
        )}
        {user && (
          <li>
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
