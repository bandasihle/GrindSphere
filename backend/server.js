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
