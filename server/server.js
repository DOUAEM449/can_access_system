// server/server.js
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const initDB = require('./initDB');

const app = express();
const port = 3001;

// Configuration
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Pour gérer les images en base64
app.use('/images', express.static(path.join(__dirname, 'images')));

// Initialisation de la base de données
initDB();
const db = new sqlite3.Database('./users.db');

// 🔐 Route de login
app.post('/api/login', (req, res) => {
  const { username, password, role } = req.body;

  const query = `SELECT * FROM users WHERE username = ? AND password = ? AND role = ?`;
  db.get(query, [username, password, role], (err, row) => {
    if (err) {
      console.error("Erreur lors du login :", err);
      return res.status(500).json({ success: false, message: "Erreur de serveur" });
    }

    if (row) {
      res.json({ 
        success: true, 
        role: row.role, 
        user: row.username,
        userInfo: {
          fullname: row.fullname,
          email: row.email,
          image: row.image
        }
      });
    } else {
      res.status(401).json({ success: false, message: "Identifiants invalides" });
    }
  });
});

// 📋 Récupérer les logs d'un worker
app.get('/api/worker/:username/logs', (req, res) => {
  const username = req.params.username;

  const sql = `
    SELECT logs.action, logs.time, logs.gate 
    FROM logs 
    JOIN users ON users.id = logs.user_id 
    WHERE users.username = ?
    ORDER BY logs.time ASC
  `;

  db.all(sql, [username], (err, rows) => {
    if (err) {
      console.error("Erreur lors de la récupération des logs :", err);
      res.status(500).json({ error: "Erreur lors de la récupération des logs." });
    } else {
      res.json({ logs: rows });
    }
  });
});

// 👤 Gestion des utilisateurs

// Récupérer tous les utilisateurs
app.get('/api/users', (req, res) => {
  db.all('SELECT id, username, fullname, email, role, image FROM users', [], (err, rows) => {
    if (err) {
      console.error("Erreur récupération utilisateurs:", err);
      return res.status(500).json({ error: "Erreur serveur" });
    }
    res.json(rows);
  });
});

// Récupérer un utilisateur
app.get('/api/user/:username', (req, res) => {
  const username = req.params.username;

  db.get(
    `SELECT id, username, fullname, email, role, image 
     FROM users WHERE username = ?`,
    [username],
    (err, row) => {
      if (err || !row) {
        console.error("Erreur récupération utilisateur:", err);
        return res.status(404).json({ error: "Utilisateur non trouvé" });
      }
      
      // Si l'image existe physiquement
      if (row.image && fs.existsSync(path.join(__dirname, row.image))) {
        row.image = `http://localhost:${port}/${row.image}`;
      } else {
        row.image = `http://localhost:${port}/images/worker.jpg`;
      }
      
      res.json(row);
    }
  );
});

// Créer un nouvel utilisateur
app.post('/api/users', (req, res) => {
  const { username, password, fullname, email, role, image } = req.body;

  // Validation simple
  if (!username || !password || !fullname || !email || !role) {
    return res.status(400).json({ error: "Tous les champs sont obligatoires" });
  }

  db.run(
    `INSERT INTO users (username, password, fullname, email, role, image)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [username, password, fullname, email, role, image],
    function(err) {
      if (err) {
        console.error("Erreur création utilisateur:", err);
        return res.status(400).json({ error: "Nom d'utilisateur déjà utilisé" });
      }
      res.json({ 
        id: this.lastID,
        message: "Utilisateur créé avec succès"
      });
    }
  );
});

// Mettre à jour un utilisateur
app.put('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const { username, password, fullname, email, role, image } = req.body;

  db.run(
    `UPDATE users 
     SET username = ?, password = ?, fullname = ?, email = ?, role = ?, image = ?
     WHERE id = ?`,
    [username, password, fullname, email, role, image, id],
    function(err) {
      if (err) {
        console.error("Erreur mise à jour utilisateur:", err);
        return res.status(400).json({ error: "Erreur de mise à jour" });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: "Utilisateur non trouvé" });
      }
      res.json({ message: "Utilisateur mis à jour avec succès" });
    }
  );
});

// Supprimer un utilisateur
app.delete('/api/users/:id', (req, res) => {
  const { id } = req.params;

  db.run(
    'DELETE FROM users WHERE id = ?',
    [id],
    function(err) {
      if (err) {
        console.error("Erreur suppression utilisateur:", err);
        return res.status(500).json({ error: "Erreur serveur" });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: "Utilisateur non trouvé" });
      }
      res.json({ message: "Utilisateur supprimé avec succès" });
    }
  );
});

// 📊 Statistiques pour le dashboard
app.get('/api/worker/:username/stats', (req, res) => {
  const username = req.params.username;

  const sql = `
    SELECT logs.action, logs.time, logs.gate 
    FROM logs 
    JOIN users ON users.id = logs.user_id 
    WHERE users.username = ?
    ORDER BY logs.time ASC
  `;

  db.all(sql, [username], (err, logs) => {
    if (err) {
      console.error("Erreur récupération stats:", err);
      return res.status(500).json({ error: "Erreur serveur" });
    }

    let totalHours = 0;
    const gatesUsed = new Set();

    for (let i = 0; i < logs.length; i++) {
      if (logs[i].action === 'entry') {
        const exitLog = logs[i + 1];
        if (exitLog && exitLog.action === 'exit') {
          const entryTime = new Date(logs[i].time);
          const exitTime = new Date(exitLog.time);
          totalHours += (exitTime - entryTime) / (1000 * 60 * 60);
          gatesUsed.add(logs[i].gate);
        }
      }
    }

    res.json({
      totalHours: parseFloat(totalHours.toFixed(2)),
      gatesUsed: Array.from(gatesUsed)
    });
  });
});

// Démarrer le serveur
app.listen(port, () => {
  console.log(`✅ Backend server running on http://localhost:${port}`);
});