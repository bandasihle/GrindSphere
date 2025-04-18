const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cors = require('cors');
const db = require('./db'); // Your database connection

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

app.post('/signup', async (req, res) => {
  const { name, email, password, role, skill } = req.body;

  // Check if the user already exists
  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Server error' });
    }

    if (result.length > 0) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the database
    const query = 'INSERT INTO users (name, email, password, role, skill) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [name, email, hashedPassword, role, skill || null], (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to register user' });
      }

      res.status(200).json({ message: 'User registered successfully' });
    });
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// ===========================
//  Hustler Services Routes
// ===========================

// Create a new service (hustler)
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

// GET all services
app.get('/api/services', async (req, res) => {
  try {
    // use promise().execute to get [rows]
    const [rows] = await db.promise().execute('SELECT * FROM services');
    return res.status(200).json(rows);
  } catch (err) {
    console.error('Error fetching services:', err);
    return res.status(500).json({ message: 'Error fetching services' });
  }
});


// Get single service by ID
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

// Update service (hustler)
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

// Delete service (hustler)
app.delete('/api/services/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.promise().execute('DELETE FROM services WHERE id = ?', [id]);
    res.status(200).json({ message: 'Service deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch all available services for the customer dashboard
app.get('/api/services', (req, res) => {
  const query = 'SELECT * FROM services';

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching services' });
    }

    res.status(200).json(results);
  });
});


