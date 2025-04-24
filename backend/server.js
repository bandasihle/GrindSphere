// Required Modules
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cors = require('cors');
const db = require('./db'); // Ensure db.js exports both query and promise()

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// ===========================
//  Signup Route
// ===========================
app.post('/signup', async (req, res) => {
  const { name, email, password, role, skill } = req.body;

  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, result) => {
    if (err) return res.status(500).json({ message: 'Server error' });

    if (result.length > 0)
      return res.status(400).json({ message: 'Email is already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const query = 'INSERT INTO users (name, email, password, role, skill) VALUES (?, ?, ?, ?, ?)';

    db.query(query, [name, email, hashedPassword, role, skill || null], (err) => {
      if (err) return res.status(500).json({ message: 'Failed to register user' });
      res.status(200).json({ message: 'User registered successfully' });
    });
  });
});

// ===========================
//  Login Route
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
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        skill: user.skill || null
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error during login' });
  }
});

// ===========================
//  Hustler Service CRUD
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

app.get('/api/services/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.promise().execute('SELECT * FROM services WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Service not found' });
    res.status(200).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/services/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, price, category, location } = req.body;
  try {
    await db.promise().execute(
      'UPDATE services SET title = ?, description = ?, price = ?, category = ?, location = ? WHERE id = ?',
      [title, description, price, category, location, id]
    );
    res.status(200).json({ message: 'Service updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/services/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.promise().execute('DELETE FROM services WHERE id = ?', [id]);
    res.status(200).json({ message: 'Service deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
