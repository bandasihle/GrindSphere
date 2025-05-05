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

app.post('/bookings', (req, res) => {
  const { customer_id, service_id } = req.body;

  const sql = 'INSERT INTO bookings (customer_id, service_id) VALUES (?, ?)';
  db.query(sql, [customer_id, service_id], (err, result) => {
    if (err) {
      console.error('Error creating booking:', err);
      return res.status(500).json({ error: 'Failed to create booking' });
    }
    res.status(201).json({ message: 'Booking successful', bookingId: result.insertId });
  });
});

app.get('/bookings', (req, res) => {
  const customerId = req.query.customerId;

  const sql = `
    SELECT b.id AS bookingId, s.title, s.category, s.price, s.description, b.booking_time, b.status
    FROM bookings b
    JOIN services s ON b.service_id = s.id
    WHERE b.customer_id = ?
    ORDER BY b.booking_time DESC
  `;

  db.query(sql, [customerId], (err, results) => {
    if (err) {
      console.error('Error fetching bookings:', err);
      return res.status(500).json({ error: 'Failed to get bookings' });
    }
    res.json(results);
  });
});


app.delete('/bookings/:id', (req, res) => {
  const bookingId = req.params.id;

  const sql = 'DELETE FROM bookings WHERE id = ?';
  db.query(sql, [bookingId], (err, result) => {
    if (err) {
      console.error('Error cancelling booking:', err);
      return res.status(500).json({ error: 'Failed to cancel booking' });
    }
    res.json({ message: 'Booking cancelled successfully' });
  });
});

// GET services with optional filters
app.get('/services', (req, res) => {
  const { category, location, hustlerId } = req.query;

  let sql = 'SELECT s.*, u.name AS hustler_name FROM services s JOIN users u ON s.hustler_id = u.id WHERE 1';
  const values = [];

  if (category) {
    sql += ' AND s.category = ?';
    values.push(category);
  }

  if (location) {
    sql += ' AND s.location = ?';
    values.push(location);
  }

  if (hustlerId) {
    sql += ' AND s.hustler_id = ?';
    values.push(hustlerId);
  }

  db.query(sql, values, (err, results) => {
    if (err) {
      console.error('Error fetching services:', err);
      return res.status(500).json({ error: 'Failed to get services' });
    }
    res.json(results);
  });
});

// POST create a new service
app.post('/services', (req, res) => {
  const { hustler_id, title, description, price, category, location, image_url } = req.body;

  const sql = `
    INSERT INTO services (hustler_id, title, description, price, category, location, image_url)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [hustler_id, title, description, price, category, location, image_url], (err, result) => {
    if (err) {
      console.error('Error creating service:', err);
      return res.status(500).json({ error: 'Failed to create service' });
    }
    res.status(201).json({ message: 'Service created', serviceId: result.insertId });
  });
});

// PUT update a service
app.put('/services/:id', (req, res) => {
  const serviceId = req.params.id;
  const { title, description, price, category, location, image_url } = req.body;

  const sql = `
    UPDATE services 
    SET title = ?, description = ?, price = ?, category = ?, location = ?, image_url = ?
    WHERE id = ?
  `;

  db.query(sql, [title, description, price, category, location, image_url, serviceId], (err, result) => {
    if (err) {
      console.error('Error updating service:', err);
      return res.status(500).json({ error: 'Failed to update service' });
    }
    res.json({ message: 'Service updated successfully' });
  });
});

// DELETE a service
app.delete('/services/:id', (req, res) => {
  const serviceId = req.params.id;

  const sql = 'DELETE FROM services WHERE id = ?';
  db.query(sql, [serviceId], (err, result) => {
    if (err) {
      console.error('Error deleting service:', err);
      return res.status(500).json({ error: 'Failed to delete service' });
    }
    res.json({ message: 'Service deleted successfully' });
  });
});
const multer = require('multer');
const path = require('path');

// Set up storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`);
  }
});

const upload = multer({ storage });

// Route to handle service creation with image
app.post('/services', upload.single('image'), (req, res) => {
  // ✅ req.body will now be defined, even for multipart/form-data
  const { hustler_id, title, description, price, category, location } = req.body;
  const image_url = req.file ? req.file.filename : null;

  if (!hustler_id || !title || !description || !price || !category || !location || !image_url) {
    return res.status(400).json({ error: 'All fields are required including image' });
  }

  const sql = `
    INSERT INTO services (hustler_id, title, description, price, category, location, image_url)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [hustler_id, title, description, price, category, location, image_url], (err, result) => {
    if (err) {
      console.error('Error inserting service:', err);
      return res.status(500).json({ error: 'Database error creating service' });
    }
    res.status(201).json({ message: 'Service created successfully', serviceId: result.insertId });
  });
});



