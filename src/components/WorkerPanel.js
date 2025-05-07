import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../AuthContext';

const WorkerPanel = () => {
  const { user } = useContext(AuthContext);
  const [logs, setLogs] = useState([]);
  const [message, setMessage] = useState('');
  
  useEffect(() => {
    fetchLogs();
  }, [user]);

  const fetchLogs = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/logs/${user}`);
      setLogs(response.data);
    } catch (error) {
      console.error('Error fetching logs', error);
      setMessage('Unable to load logs. Please try again later.');
    }
  };

  const handleLogAction = async (actionType) => {
    try {
      const endpoint = actionType === 'login' ? 'login-action' : 'logout-action';
      const response = await axios.post(`http://localhost:5000/${endpoint}`, { user });
      if (response.data.success) {
        setMessage(`${actionType === 'login' ? 'Logged In' : 'Logged Out'} Successfully!`);
        fetchLogs(); // Refresh logs after action
      } else {
        setMessage(`Error during ${actionType}. Please try again.`);
      }
    } catch (error) {
      console.error(`Error during ${actionType}`, error);
      setMessage(`Error during ${actionType}.`);
    }
  };

  return (
    <div className="worker-panel">
      <h2>Welcome, {user}</h2>
      <div className="actions">
        <button onClick={() => handleLogAction('login')} className="login-btn">
          Log In
        </button>
        <button onClick={() => handleLogAction('logout')} className="logout-btn">
          Log Out
        </button>
      </div>
      {message && <p className="message">{message}</p>}
      <h3>Your Access Logs</h3>
      <ul className="logs">
        {logs.length ? (
          logs.map((log, index) => (
            <li key={index}>
              <strong>Action:</strong> {log.action} | <strong>Time:</strong> {log.time}
            </li>
          ))
        ) : (
          <li>No log entries available.</li>
        )}
      </ul>
    </div>
  );
};

export default WorkerPanel;
