
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./students.sqlite', (err) => {
  if (err) {
    console.error('Error opening database', err.message);
    process.exit(1);
  }
});

const sql = `CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  firstname TEXT NOT NULL,
  lastname TEXT NOT NULL,
  gender TEXT NOT NULL,
  age TEXT
)`;

db.run(sql, (err) => {
  if (err) {
    console.error('Error creating table:', err.message);
  } else {
    console.log('Tabla "students" creada o ya existente.');
  }
  db.close();
});
