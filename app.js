
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const PORT = 8001;
const HOST = '0.0.0.0';

// middlewares
app.use(express.urlencoded({ extended: true })); // para form-data
app.use(express.json()); // para JSON bodies

// abrir DB (archivo)
const db = new sqlite3.Database('./students.sqlite', (err) => {
  if (err) {
    console.error('No se pudo conectar a la base de datos:', err.message);
    process.exit(1);
  }
  console.log('Conectado a students.sqlite');
});

// asegurar que la tabla exista (por si no ejecutaste db.js)
db.run(`CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  firstname TEXT NOT NULL,
  lastname TEXT NOT NULL,
  gender TEXT NOT NULL,
  age TEXT
)`);

// GET /students (lista)  & POST /students (crear)
app.route('/students')
  .get((req, res) => {
    const sql = 'SELECT * FROM students';
    db.all(sql, [], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      // rows ya vienen como objetos { id, firstname, ... }
      return res.json(rows);
    });
  })
  .post((req, res) => {
    // soporta application/x-www-form-urlencoded y application/json
    const { firstname, lastname, gender, age } = req.body;
    if (!firstname || !lastname || !gender) {
      return res.status(400).json({ error: 'firstname, lastname y gender son requeridos' });
    }

    const sql = `INSERT INTO students (firstname, lastname, gender, age)
                 VALUES (?, ?, ?, ?)`;
    db.run(sql, [firstname, lastname, gender, age || null], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      // this.lastID contiene el id insertado
      return res.status(201).json({ message: `Student with id: ${this.lastID} created successfully`, id: this.lastID });
    });
  });

// Rutas para estudiante individual
app.route('/student/:id')
  .get((req, res) => {
    const id = Number(req.params.id);
    const sql = 'SELECT * FROM students WHERE id = ?';
    db.get(sql, [id], (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(404).json({ error: 'Student not found' });
      return res.json(row);
    });
  })
  .put((req, res) => {
    const id = Number(req.params.id);
    const { firstname, lastname, gender, age } = req.body;
    if (!firstname || !lastname || !gender) {
      return res.status(400).json({ error: 'firstname, lastname y gender son requeridos' });
    }

    const sql = `UPDATE students
                 SET firstname = ?, lastname = ?, gender = ?, age = ?
                 WHERE id = ?`;
    db.run(sql, [firstname, lastname, gender, age || null, id], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Student not found' });

      const updated = { id, firstname, lastname, gender, age };
      return res.json(updated);
    });
  })
  .delete((req, res) => {
    const id = Number(req.params.id);
    const sql = 'DELETE FROM students WHERE id = ?';
    db.run(sql, [id], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Student not found' });
      return res.status(200).json({ message: `The Student with id: ${id} has been deleted.` });
    });
  });

app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}/`);
});
