import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

const LoginPage = () => {
  const { setUser, setRole } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRoleState] = useState('worker');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role }),
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setRole(data.role);
        setMessageType('success');
        setMessage('Connexion réussie ! Redirection...');
        setTimeout(() => {
          navigate(data.role === 'admin' ? '/dashboard-admin' : '/dashboard-worker', { replace: true });
        }, 1500);
      } else {
        setMessageType('error');
        setMessage(data.message || 'Identifiants incorrects.');
      }
    } catch (error) {
      setMessageType('error');
      setMessage("Erreur de connexion au serveur.");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.logoContainer}>
          <img 
            src="/images/can_maroc_2025.jpg" 
            alt="CAN Maroc Logo" 
            style={styles.logo}
          />
          <h1 style={styles.header}>Portail d'Accès</h1>
        </div>
        
        <div style={styles.card}>
          {message && (
            <div style={{ 
              ...styles.message, 
              ...(messageType === 'success' ? styles.success : styles.error) 
            }}>
              {message}
            </div>
          )}

          <div style={styles.inputGroup}>
            <label style={styles.label}>Nom d'utilisateur</label>
            <input
              style={styles.input}
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Mot de passe</label>
            <input
              style={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Rôle</label>
            <select 
              style={styles.select} 
              value={role} 
              onChange={(e) => setRoleState(e.target.value)}
            >
              <option value="admin">Administrateur</option>
              <option value="worker">Employé</option>
            </select>
          </div>

          <button 
            style={styles.button} 
            onClick={handleLogin}
            onMouseEnter={(e) => e.target.style.opacity = 0.9}
            onMouseLeave={(e) => e.target.style.opacity = 1}
          >
            Se connecter
          </button>
        </div>

        <div style={styles.footer}>
          <p style={styles.footerText}>CAN Maroc 2025 - Tous droits réservés</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

// Styles avec thème CAN Maroc (rouge et vert)
const styles = {
  page: {
    height: '100vh',
    backgroundColor: '#f5f5f5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    backgroundImage: 'linear-gradient(rgba(255,255,255,0.9), rgba(255,255,255,0.9))',
  },
  container: {
    width: '100%',
    maxWidth: 450,
    padding: 20,
  },
  logoContainer: {
    textAlign: 'center',
    marginBottom: 30,
  },
  logo: {
    height: 80,
    marginBottom: 15,
  },
  header: {
    color: '#043121',
    fontSize: 24,
    fontWeight: 600,
    margin: 0,
  },
  card: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 10,
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    borderTop: '5px solid #D45F4A',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    display: 'block',
    marginBottom: 8,
    color: '#043121',
    fontSize: 14,
    fontWeight: 500,
  },
  input: {
    width: '100%',
    padding: '12px 15px',
    borderRadius: 6,
    border: '1px solid #ddd',
    fontSize: 14,
    transition: 'border 0.3s',
    boxSizing: 'border-box',
  },
  select: {
    width: '100%',
    padding: '12px 15px',
    borderRadius: 6,
    border: '1px solid #ddd',
    fontSize: 14,
    backgroundColor: 'white',
    cursor: 'pointer',
  },
  button: {
    width: '100%',
    padding: 14,
    backgroundColor: '#D45F4A', // Rouge CAN
    color: 'white',
    border: 'none',
    borderRadius: 6,
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s',
    marginTop: 10,
  },
  message: {
    marginBottom: 20,
    padding: '12px 15px',
    borderRadius: 6,
    fontSize: 14,
    textAlign: 'center',
  },
  success: {
    backgroundColor: '#e6f7ee',
    color: '#043121', // Vert foncé
    border: '1px solid #a3d8b9',
  },
  error: {
    backgroundColor: '#ffebee',
    color: '#D45F4A', // Rouge CAN
    border: '1px solid #ffcdd2',
  },
  footer: {
    textAlign: 'center',
    marginTop: 30,
  },
  footerText: {
    color: '#666',
    fontSize: 12,
  },
};