// src/components/WorkHoursGraph.js

import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const WorkHoursGraph = ({ workData }) => {
  // workData is expected to be an array of objects: [{ date: '2025-04-25', hours: 6 }, ...]
  const data = {
    labels: workData.map((item) => item.date),
    datasets: [
      {
        label: 'Hours Worked',
        data: workData.map((item) => item.hours),
        fill: false,
        backgroundColor: '#008000',
        borderColor: '#ff6347',
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#fff',
        },
      },
      title: {
        display: true,
        text: 'Hours Worked by Date',
        color: '#fff',
      },
    },
    scales: {
      x: {
        ticks: { color: '#fff' },
        grid: { color: 'rgba(255,255,255,0.2)' },
      },
      y: {
        ticks: { color: '#fff' },
        grid: { color: 'rgba(255,255,255,0.2)' },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="work-hours-graph">
      <Line data={data} options={options} />
    </div>
  );
};

export default WorkHoursGraph;
