const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

// Create Express app
const app = express();

// Vercel serverless function export
module.exports = app;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files (HTML, CSS, JS) - Vercel handles static files automatically
// but we need to serve them through Express for serverless
app.use(express.static(path.join(__dirname)));

// In-memory storage for bookings (since SQLite doesn't work in Vercel serverless)
let bookings = [];
let bookingIdCounter = 1;
let maintenanceMode = false;

// API endpoint to handle booking submissions
app.post('/api/book', (req, res) => {
  const { name, email, phone, date, time, service, message } = req.body;

  if (!name || !email || !phone || !date || !time || !service) {
    return res.status(400).json({ error: 'All required fields must be filled' });
  }

  const booking = {
    id: bookingIdCounter++,
    name,
    email,
    phone,
    date,
    time,
    service,
    message: message || '',
    createdAt: new Date().toISOString()
  };

  bookings.push(booking);
  res.json({ success: true, booking });
});

// API endpoint to get all bookings (for admin)
app.get('/api/bookings', (req, res) => {
  res.json(bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

// API endpoint to delete a booking by ID
app.delete('/api/bookings/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = bookings.findIndex(b => b.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  bookings.splice(index, 1);
  res.json({ success: true });
});

// Maintenance Mode API
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

app.post('/api/portfolio/upload', (req, res) => {
  // For Vercel serverless, simulate file upload success
  // In production, you'd use cloud storage like AWS S3, Cloudinary, etc.
  res.json({
    success: true,
    files: [],
    note: 'File upload simulated - use cloud storage for production'
  });
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

// For Vercel serverless, don't start the server - just export the app
// app.listen(PORT, () => {
//   console.log(`Server running at http://localhost:${PORT}`);
// });
