const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Vercel serverless function export
module.exports = app;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname)));

// Ensure image directory exists
const imageDir = path.join(__dirname, 'image');
if (!fs.existsSync(imageDir)) {
  fs.mkdirSync(imageDir);
}

// For Vercel, we'll use memory storage for file uploads
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Database setup - Use in-memory database for Vercel serverless
const db = new sqlite3.Database(':memory:', (err) => {
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

// Maintenance Mode API
let maintenanceMode = false;

app.get('/api/maintenance', (req, res) => {
  res.json({ enabled: maintenanceMode });
});

app.post('/api/maintenance', (req, res) => {
  const { enabled } = req.body;
  maintenanceMode = enabled;
  res.json({ success: true, enabled });
});

// Portfolio Management API - For Vercel, return static images
app.get('/api/portfolio', (req, res) => {
  // Return the existing images in the image folder
  const staticImages = [
    { filename: '1w.jpg', url: '/image/1w.jpg' },
    { filename: 'e8.jpg', url: '/image/e8.jpg' },
    { filename: 'e9.jpg', url: '/image/e9.jpg' },
    { filename: 'w2.jpg', url: '/image/w2.jpg' },
    { filename: 'w3.jpg', url: '/image/w3.jpg' },
    { filename: 'w4.jpg', url: '/image/w4.jpg' },
    { filename: 'w5.jpg', url: '/image/w5.jpg' },
    { filename: 'w7.jpg', url: '/image/w7.jpg' },
    { filename: 'w10.jpg', url: '/image/w10.jpg' },
    { filename: 'w11.jpg', url: '/image/w11.jpg' },
    { filename: 'w12.jpg', url: '/image/w12.jpg' },
    { filename: 'w13.jpg', url: '/image/w13.jpg' },
    { filename: 'w14.jpg', url: '/image/w14.jpg' },
    { filename: 'w16.jpg', url: '/image/w16.jpg' },
    { filename: 'w17.jpg', url: '/image/w17.jpg' },
    { filename: 'w18.jpg', url: '/image/w18.jpg' },
    { filename: 'w20.jpg', url: '/image/w20.jpg' }
  ];

  res.json(staticImages);
});

app.post('/api/portfolio/upload', upload.array('images', 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }

  // For Vercel, we'll simulate file storage by returning success
  // In a real deployment, you'd use cloud storage like AWS S3, Cloudinary, etc.
  const uploadedFiles = req.files.map((file, index) => {
    const filename = `uploaded-${Date.now()}-${index}${path.extname(file.originalname)}`;
    return {
      filename: filename,
      url: `/image/${filename}` // This won't work in serverless, but for demo purposes
    };
  });

  res.json({ success: true, files: uploadedFiles, note: 'File upload simulated - use cloud storage for production' });
});

app.delete('/api/portfolio/:filename', (req, res) => {
  // For Vercel serverless, simulate deletion success
  // In production, you'd delete from cloud storage
  res.json({ success: true, note: 'Deletion simulated - use cloud storage for production' });
});

// Serve admin page
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
