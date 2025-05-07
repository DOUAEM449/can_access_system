// src/pages/AdminDashboard.js
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import WorkHoursGraph from '../components/WorkHoursGraph';

const AdminDashboard = () => {
  const { user, role } = useContext(AuthContext);
  const navigate = useNavigate();

  // Enforce admin authentication
  useEffect(() => {
    if (!user || role !== 'admin') {
      navigate("/", { replace: true });
    }
  }, [user, role, navigate]);

  // Dummy workers data with images
  const dummyWorkersData = [
    {
      worker: 'fati',
      image: '/images/fati.jpeg', // path in the public folder
      logs: [
        { action: 'entry', time: '2025-04-28T08:00:00', gate: 'Gate 1' },
        { action: 'exit', time: '2025-04-28T12:00:00', gate: 'Gate 1' },
        { action: 'entry', time: '2025-04-29T09:00:00', gate: 'Gate 2' },
        { action: 'exit', time: '2025-04-29T15:00:00', gate: 'Gate 2' },
        { action: 'entry', time: '2025-04-30T10:00:00', gate: 'Gate 1' },
        { action: 'exit', time: '2025-04-30T14:00:00', gate: 'Gate 1' },
      ],
    },
    {
      worker: 'smith',
      image: '/images/smith.jpg',
      logs: [
        { action: 'entry', time: '2025-04-27T08:30:00', gate: 'Gate 3' },
        { action: 'exit', time: '2025-04-27T11:30:00', gate: 'Gate 3' },
        { action: 'entry', time: '2025-04-28T10:00:00', gate: 'Gate 2' },
        { action: 'exit', time: '2025-04-28T16:00:00', gate: 'Gate 2' },
        { action: 'entry', time: '2025-04-29T09:00:00', gate: 'Gate 1' },
        { action: 'exit', time: '2025-04-29T13:00:00', gate: 'Gate 1' },
      ],
    },
  ];

  const [selectedWorker, setSelectedWorker] = useState(dummyWorkersData[0].worker);
  const [workerData, setWorkerData] = useState(dummyWorkersData[0]);

  const handleWorkerChange = (e) => {
    const workerName = e.target.value;
    setSelectedWorker(workerName);
    const selectedData = dummyWorkersData.find((w) => w.worker === workerName);
    setWorkerData(selectedData);
  };

  // Compute daily work data for the graph
  const computeDailyWork = (logs) => {
    const dailyData = {};
    for (let i = 0; i < logs.length; i++) {
      if (logs[i].action === 'entry') {
        const exitLog = logs[i + 1];
        if (exitLog && exitLog.action === 'exit') {
          const entryTime = new Date(logs[i].time);
          const exitTime = new Date(exitLog.time);
          const diff = (exitTime - entryTime) / (1000 * 60 * 60);
          const dateStr = entryTime.toISOString().split('T')[0];
          if (!dailyData[dateStr]) {
            dailyData[dateStr] = diff;
          } else {
            dailyData[dateStr] += diff;
          }
        }
      }
    }
    const result = Object.keys(dailyData).map((date) => ({
      date,
      hours: dailyData[date],
    }));
    result.sort((a, b) => a.date.localeCompare(b.date));
    return result;
  };

  const computeSummary = (logs) => {
    let total = 0;
    const gates = new Set();
    for (let i = 0; i < logs.length; i++) {
      if (logs[i].action === 'entry') {
        const exitLog = logs[i + 1];
        if (exitLog && exitLog.action === 'exit') {
          const entryTime = new Date(logs[i].time);
          const exitTime = new Date(exitLog.time);
          total += (exitTime - entryTime) / (1000 * 60 * 60);
          gates.add(logs[i].gate);
        }
      }
    }
    return { totalHours: total, gatesUsed: Array.from(gates) };
  };

  const summary = computeSummary(workerData.logs);
  const dailyWorkData = computeDailyWork(workerData.logs);

  return (
    <div className="dashboard-container container">
      <div className="dashboard-left">
        <h2>Admin Dashboard</h2>
        <h3>Select a Worker</h3>
        <select value={selectedWorker} onChange={handleWorkerChange}>
          {dummyWorkersData.map((worker, index) => (
            <option key={index} value={worker.worker}>
              {worker.worker}
            </option>
          ))}
        </select>

        {/* Worker Profile Image */}
        <div className="profile-image-container">
          <img src={workerData.image} alt={`${workerData.worker} Profile`} className="profile-image"/>
        </div>

        <div className="worker-summary">
          <h3>Worker: {workerData.worker}</h3>
          <p>Total Hours Inside the Stadium: {summary.totalHours.toFixed(2)} hours</p>
          <p>Gates Used:</p>
          <ul>
            {summary.gatesUsed.map((gate, idx) => (
              <li key={idx}>{gate}</li>
            ))}
          </ul>
        </div>
        <div className="logs">
          <h3>Access Log Details:</h3>
          <ul>
            {workerData.logs.map((log, index) => (
              <li key={index}>
                {log.action} at {new Date(log.time).toLocaleString()} via {log.gate}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="dashboard-right">
        <WorkHoursGraph workData={dailyWorkData} />
      </div>
    </div>
  );
};

export default AdminDashboard;
