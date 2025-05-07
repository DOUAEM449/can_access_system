import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import WorkHoursGraph from '../components/WorkHoursGraph';

const WorkerDashboard = () => {
  const { user, role } = useContext(AuthContext);
  const navigate = useNavigate();

  const [logs, setLogs] = useState([
    { action: 'entry', time: '2025-04-28T08:00:00', gate: 'Gate 1' },
    { action: 'exit', time: '2025-04-28T12:00:00', gate: 'Gate 1' },
    { action: 'entry', time: '2025-04-29T09:00:00', gate: 'Gate 2' },
    { action: 'exit', time: '2025-04-29T15:00:00', gate: 'Gate 2' },
    { action: 'entry', time: '2025-04-30T10:00:00', gate: 'Gate 1' },
    { action: 'exit', time: '2025-04-30T14:00:00', gate: 'Gate 1' },
  ]);
  
  const [totalHours, setTotalHours] = useState(0);
  const [gatesUsed, setGatesUsed] = useState([]);
  const [profileImage, setProfileImage] = useState('/images/fati.jpeg');

  useEffect(() => {
    if (!user || role !== 'worker') {
      navigate("/", { replace: true });
    } else {
      // Calculer les stats dès le chargement avec les logs fournis
      calculateStats(logs);

      // Récupérer l'image de profil depuis l'API
      fetch(`/api/user/${user}`)
        .then(res => res.json())
        .then(data => {
          if (data.image) setProfileImage(data.image);
        })
        .catch(err => {
          console.error("Erreur lors de la récupération de l'image:", err);
        });
    }
  }, [user, role, navigate, logs]);

  const calculateStats = (logs) => {
    let hours = 0;
    const gates = new Set();

    // Trier les logs par date pour s'assurer de l'ordre entry/exit
    const sortedLogs = [...logs].sort((a, b) => new Date(a.time) - new Date(b.time));

    for (let i = 0; i < sortedLogs.length; i++) {
      if (sortedLogs[i].action === 'entry') {
        const exitLog = sortedLogs[i + 1];
        if (exitLog && exitLog.action === 'exit') {
          const inTime = new Date(sortedLogs[i].time);
          const outTime = new Date(exitLog.time);
          hours += (outTime - inTime) / (1000 * 60 * 60); // en heures
          gates.add(sortedLogs[i].gate);
        }
      }
    }

    setTotalHours(hours);
    setGatesUsed([...gates]);
  };

  // Données pour le graphique calculées à partir des logs
  const workData = logs.reduce((acc, log, index, array) => {
    if (log.action === 'entry') {
      const exitLog = array[index + 1];
      if (exitLog && exitLog.action === 'exit') {
        const date = log.time.split('T')[0];
        const entryTime = new Date(log.time);
        const exitTime = new Date(exitLog.time);
        const hours = (exitTime - entryTime) / (1000 * 60 * 60);
        
        const existingDay = acc.find(item => item.date === date);
        if (existingDay) {
          existingDay.hours += hours;
        } else {
          acc.push({ date, hours });
        }
      }
    }
    return acc;
  }, []);

  return (
    <div className="dashboard-container container">
      {/* Profil */}
      <div className="profile-image-container">
        <img
          src={profileImage}
          alt="Profile"
          className="profile-image"
          onError={() => setProfileImage('/images/worker.jpg')}
        />
      </div>

      {/* Infos principales */}
      <div className="dashboard-left">
        <h2>Worker Dashboard</h2>
        <p>Welcome, <strong>{user}</strong></p>

        <div className="dashboard-info">
          <h3>Total Hours Inside the Stadium: <span>{totalHours.toFixed(2)} hours</span></h3>
          <h3>Gates Used:</h3>
          <ul>
            {gatesUsed.map((gate, index) => (
              <li key={index}>{gate}</li>
            ))}
          </ul>
        </div>

        {/* Liste formatée des logs */}
        <div className="logs">
          <h3>Access Log Details:</h3>
          <ul>
            {logs
              .sort((a, b) => new Date(a.time) - new Date(b.time))
              .map((log, index) => {
                const dateObj = new Date(log.time);
                const formattedDate = dateObj.toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                });
                const formattedTime = dateObj.toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit'
                });
                return (
                  <li key={index} className={`log-item ${log.action}`}> 
                    <span className="log-action">{log.action } at </span> 
                    <span className="log-time">{formattedDate } à {formattedTime }</span>
                    <span className="log-gate"> via {log.gate }</span>
                  </li>
                );
              })}
          </ul>
        </div>
      </div>

      {/* Graphique */}
      <div className="dashboard-right">
        <WorkHoursGraph workData={workData} />
      </div>
    </div>
  );
};

export default WorkerDashboard;