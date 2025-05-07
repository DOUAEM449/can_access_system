import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

const socket = io('http://localhost:5000'); // Adjust URL if necessary

const AdminPanel = () => {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredLogs, setFilteredLogs] = useState([]);

  // Initial fetch of logs
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await axios.get('http://localhost:5000/logs');
        setLogs(response.data);
        setFilteredLogs(response.data);
      } catch (error) {
        console.error('Error fetching logs', error);
      }
    };
    fetchLogs();
  }, []);

  // Listen for real-time updates
  useEffect(() => {
    socket.on('new_log', (newLog) => {
      setLogs(prevLogs => [newLog, ...prevLogs]);
      if (searchTerm.trim()) {
        setFilteredLogs(prevLogs =>
          [newLog, ...prevLogs].filter((log) =>
            log.worker.toLowerCase().includes(searchTerm.toLowerCase())
          )
        );
      } else {
        setFilteredLogs(prevLogs => [newLog, ...prevLogs]);
      }
    });
    return () => socket.off('new_log');
  }, [searchTerm]);

  // Filter logs based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredLogs(logs);
    } else {
      const filtered = logs.filter((log) =>
        log.worker.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredLogs(filtered);
    }
  }, [searchTerm, logs]);

  return (
    <div className="admin-panel container">
      <h2>Admin Panel: Worker Access Logs</h2>
      <input
        type="text"
        placeholder="Search by worker name..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="search-bar"
      />
      <ul className="logs">
        {filteredLogs.length ? (
          filteredLogs.map((log, index) => (
            <li key={index}>
              <span className="worker">{log.worker}</span>: {log.action} at{' '}
              <span className="timestamp">{log.time}</span>
            </li>
          ))
        ) : (
          <li>No matching logs found.</li>
        )}
      </ul>
    </div>
  );
};

export default AdminPanel;
