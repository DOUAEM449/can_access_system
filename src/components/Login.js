import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [roleSelection, setRoleSelection] = useState('worker');
  const [error, setError] = useState('');
  
  const { setUser, setRole } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      // Send credentials and role to your backend
      const response = await axios.post('http://localhost:5000/login', {
        username,
        password,
        role: roleSelection,
      });
      if (response.data.success) {
        setUser(response.data.user);
        setRole(response.data.role);
        // Redirect based on role
        if(response.data.role === 'admin'){
          navigate('/admin');
        } else {
          navigate('/worker');
        }
      } else {
        setError(response.data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login. Please try again.');
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      {error && <div className="error">{error}</div>}
      <input
        type="text"
        placeholder="Enter Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Enter Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <select value={roleSelection} onChange={e => setRoleSelection(e.target.value)}>
        <option value="worker">Worker</option>
        <option value="admin">Admin</option>
      </select>
      <button onClick={handleLogin}>Log In</button>
    </div>
  );
};

export default Login;
