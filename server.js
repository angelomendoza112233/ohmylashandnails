const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname)));

// Database setup
const db = new sqlite3.Database('./bookings.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
    // Create bookings table if it doesn't exist
    db.run(`CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      service TEXT NOT NULL,
      message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
  }
});

// API endpoint to handle booking submissions
app.post('/api/book', (req, res) => {
  const { name, email, phone, date, time, service, message } = req.body;

  if (!name || !email || !phone || !date || !time || !service) {
    return res.status(400).json({ error: 'All required fields must be filled' });
  }

  db.run(`INSERT INTO bookings (name, email, phone, date, time, service, message) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [name, email, phone, date, time, service, message || ''], function(err) {
      if (err) {
        console.error('Error inserting booking:', err.message);
        return res.status(500).json({ error: 'Failed to save booking' });
      }
      res.json({ success: true, booking: { id: this.lastID, name, email, phone, date, time, service, message: message || '', createdAt: new Date() } });
    });
});

// API endpoint to get all bookings (for admin)
app.get('/api/bookings', (req, res) => {
  db.all(`SELECT id, name, email, phone, date, time, service, message, created_at as createdAt FROM bookings ORDER BY created_at DESC`, [], (err, rows) => {
    if (err) {
      console.error('Error fetching bookings:', err.message);
      return res.status(500).json({ error: 'Failed to fetch bookings' });
    }
    res.json(rows);
  });
});

// API endpoint to delete a booking by ID
app.delete('/api/bookings/:id', (req, res) => {
  const id = parseInt(req.params.id);
  db.run(`DELETE FROM bookings WHERE id = ?`, [id], function(err) {
    if (err) {
      console.error('Error deleting booking:', err.message);
      return res.status(500).json({ error: 'Failed to delete booking' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    res.json({ success: true });
  });
});

// Serve admin page
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
