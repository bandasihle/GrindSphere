// Required Modules
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const db = require('./db');

const app = express();
const port = 3000;

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Set the views folder (where your .ejs files will be stored)

app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));

// Multer config for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`)
});
const upload = multer({ storage });

// ===========================
// Signup Route
// ===========================
app.post('/signup', async (req, res) => {
  const { name, email, password, role, skill } = req.body;
  try {
    const [existing] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) return res.status(400).json({ message: 'Email is already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const query = 'INSERT INTO users (name, email, password, role, skill) VALUES (?, ?, ?, ?, ?)';
    await db.promise().execute(query, [name, email, hashedPassword, role, skill || null]);

    res.status(200).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ===========================
// Login Route
// ===========================
app.post('/login', async (req, res) => {
  const { email, password, role } = req.body;
  try {
    const [rows] = await db.promise().execute('SELECT * FROM users WHERE email = ? AND role = ?', [email, role]);
    if (rows.length === 0) return res.status(401).json({ message: 'User not found or role mismatch' });

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Incorrect password' });

    res.status(200).json({
      message: 'Login successful',
      user: { id: user.id, name: user.name, email: user.email, role: user.role, skill: user.skill || null }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error during login', error: err.message });
  }
});

// ===========================
// CRUD Services
// ===========================
app.post('/api/services', async (req, res) => {
  const { hustler_id, title, description, price, category, location } = req.body;
  try {
    const [result] = await db.promise().execute(
      'INSERT INTO services (hustler_id, title, description, price, category, location) VALUES (?, ?, ?, ?, ?, ?)',
      [hustler_id, title, description, price, category, location]
    );
    res.status(201).json({ message: 'Service created', serviceId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/services', async (req, res) => {
  try {
    const [rows] = await db.promise().execute('SELECT * FROM services');
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching services' });
  }
});

// ===========================
// Service Search
// ===========================
app.get('/services', (req, res) => {
  const { category, location, hustlerId } = req.query;

  let sql = 'SELECT s.*, u.name AS hustler_name FROM services s JOIN users u ON s.hustler_id = u.id WHERE 1';
  const values = [];

  if (category) { sql += ' AND s.category = ?'; values.push(category); }
  if (location) { sql += ' AND s.location = ?'; values.push(location); }
  if (hustlerId) { sql += ' AND s.hustler_id = ?'; values.push(hustlerId); }

  db.query(sql, values, (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to get services' });
    res.json(results);
  });
});

// ===========================
// Views
// ===========================
app.get('/create-service', (req, res) => {
  // Render the create-service view and pass any necessary data (e.g., hustler_id)
  res.render('create-service', { hustler_id: 'some_id' });
});

// Start Server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

