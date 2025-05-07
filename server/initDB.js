// server/initDB.js
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

function initDB() {
  const dbExists = fs.existsSync('./users.db');
  const db = new sqlite3.Database('./users.db');

  db.serialize(() => {
    // Créer les tables
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin', 'worker')),
      image TEXT,
      fullname TEXT,
      email TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      action TEXT CHECK(action IN ('entry', 'exit')),
      time TEXT,
      gate TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

    if (!dbExists) {
      // Insérer les utilisateurs par défaut
      db.run(`INSERT INTO users (username, password, role, fullname, image, email) VALUES
        ('douaa', '123', 'admin', 'Admin User', '/images/douaa.jpeg', 'admin@example.com'),
        ('fati', '123', 'worker', 'Worker User', '/images/fati.jpeg', 'worker@example.com')`,
        function (err) {
          if (err) {
            console.error("Erreur lors de l'insertion des utilisateurs :", err);
            return;
          }

          // Ajouter logs pour fati
          db.get("SELECT id FROM users WHERE username = 'fati'", (err, row) => {
            if (row) {
              const userId = row.id;

              const logs = [
                { action: 'entry', time: '2025-04-30T09:00:00', gate: 'Gate 1' },
                { action: 'exit', time: '2025-04-30T12:00:00', gate: 'Gate 1' },
                { action: 'entry', time: '2025-04-30T13:00:00', gate: 'Gate 2' },
                { action: 'exit', time: '2025-04-30T17:00:00', gate: 'Gate 2' },
                { action: 'entry', time: '2025-05-01T08:00:00', gate: 'Gate A' },
                { action: 'exit', time: '2025-05-01T12:00:00', gate: 'Gate A' },
                { action: 'entry', time: '2025-05-02T09:00:00', gate: 'Gate B' },
                { action: 'exit', time: '2025-05-02T17:00:00', gate: 'Gate B' }
              ];

              logs.forEach(log => {
                db.run(
                  `INSERT INTO logs (user_id, action, time, gate) VALUES (?, ?, ?, ?)`,
                  [userId, log.action, log.time, log.gate]
                );
              });

              console.log("Données de logs insérées pour 'fati'");
            }
          });
        }
      );

      console.log('Base de données initialisée avec utilisateurs par défaut.');
    } else {
      console.log('Base de données déjà existante.');
    }
  });

  db.close();
}

module.exports = initDB;
