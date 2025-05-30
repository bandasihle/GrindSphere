const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('./db'); // Make sure db.js exports a connected pool

const app = express();
const port = 3000;

// ========================
// Middleware
// ========================
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ Corrected uploads static path
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ========================
// Multer Setup
// ========================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads'); // ✅ Corrected path
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// ========================
// User Signup Route
// ========================
app.post('/signup', async (req, res) => {
  const { name, email, password, role, skill } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'All fields are required (except skill)' });
  }

  try {
    const [existing] = await db.promise().query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = 'INSERT INTO users (name, email, password, role, skill) VALUES (?, ?, ?, ?, ?)';
    await db.promise().execute(sql, [name, email, hashedPassword, role, skill || null]);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// ========================
// User Login Route
// ========================
app.post('/login', async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ message: 'Email, password, and role are required' });
  }

  try {
    const [users] = await db.promise().query('SELECT * FROM users WHERE email = ? AND role = ?', [email, role]);

    if (users.length === 0) {
      return res.status(401).json({ message: 'User not found or role mismatch' });
    }

    const user = users[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        skill: user.skill || null,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// ========================
// Create Service Route (Image Upload)
// ========================
app.post('/services/image', upload.single('image'), async (req, res) => {
  const { hustler_id, title, description, price, category, location } = req.body;
  const image_url = req.file ? `/uploads/${req.file.filename}` : null;

  if (!hustler_id || !title || !description || !price || !category || !location || !image_url) {
    return res.status(400).json({ message: 'All fields including image are required' });
  }

  try {
    const [userCheck] = await db.promise().query('SELECT id FROM users WHERE id = ? AND role = "hustler"', [hustler_id]);
    if (userCheck.length === 0) {
      return res.status(400).json({ message: 'Invalid hustler ID or hustler does not exist' });
    }

    const sql = `
      INSERT INTO services (hustler_id, title, description, price, category, location, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.promise().execute(sql, [
      hustler_id,
      title,
      description,
      price,
      category,
      location,
      image_url,
    ]);

    res.status(201).json({
      message: 'Service created successfully',
      serviceId: result.insertId,
      image_url: `/uploads/${req.file.filename}`,
    });
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// ========================
// Get All Services Route (For Customer Dashboard)
// ========================
app.get('/services', async (req, res) => {
  try {
    const [services] = await db.promise().query(`
      SELECT 
        s.*,
        u.name as hustler_name
      FROM services s
      JOIN users u ON s.hustler_id = u.id
      ORDER BY s.created_at DESC
    `);
    res.status(200).json(services);
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// ========================
// Get Services by Hustler ID (For Hustler Dashboard)
// ========================
app.get('/services/hustler', async (req, res) => {
  const { hustlerId } = req.query;

  if (!hustlerId) {
    return res.status(400).json({ message: 'Hustler ID is required' });
  }

  if (isNaN(hustlerId)) {
    return res.status(400).json({ message: 'Hustler ID must be a valid number' });
  }

  try {
    const [services] = await db.promise().query(
      'SELECT * FROM services WHERE hustler_id = ? ORDER BY id DESC',
      [hustlerId]
    );

    res.status(200).json(services);
  } catch (error) {
    console.error('Get hustler services error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// ========================
// Booking Route (For Customer Dashboard)
// ========================
app.post('/bookings', async (req, res) => {
  const { serviceId, customerId } = req.body;

  if (!serviceId || !customerId) {
    return res.status(400).json({ message: 'Service ID and Customer ID are required' });
  }

  try {
    const [service] = await db.promise().query('SELECT * FROM services WHERE id = ?', [serviceId]);
    if (service.length === 0) {
      return res.status(404).json({ message: 'Service not found' });
    }

    await db.promise().execute(
      'INSERT INTO bookings (service_id, customer_id, status) VALUES (?, ?, "pending")',
      [serviceId, customerId]
    );

    res.status(201).json({ message: 'Booking created successfully' });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// ========================
// Start the Server
// ========================
app.listen(port, () => {
  console.log(`🚀 Server is running at http://localhost:${port}`);
});
