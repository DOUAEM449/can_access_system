// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import WorkerDashboard from './pages/WorkerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import UserManagementPage from './pages/UserManagementPage';
import Navbar from './components/Navbar';
import { AuthProvider, AuthContext } from './AuthContext';
import './styles.css';

const appStyle = {
  backgroundImage: "url('/background.png')",
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundAttachment: 'fixed',
  minHeight: '100vh',
};

function App() {
  return (
    <AuthProvider>
      <div style={appStyle}>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/dashboard-worker" element={<WorkerDashboard />} />
            <Route path="/dashboard-admin" element={<AdminDashboard />} />
            <Route
              path="/user-management"
              element={
                <AuthContext.Consumer>
                  {({ user, role }) =>
                    user && role === 'admin' ? (
                      <UserManagementPage />
                    ) : (
                      <Navigate to="/" replace />
                    )
                  }
                </AuthContext.Consumer>
              }
            />
          </Routes>
        </Router>
      </div>
    </AuthProvider>
  );
}

export default App;
