const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../db'); // your database module

// Temporary route to create an admin (only for initial setup)
router.get('/create-admin', async (req, res) => {
  const name = 'Admin';
  const email = 'admin@grindsphere.com';
  const plainPassword = 'admin123';

  try {
    // Check if the admin already exists
    const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.send('❗Admin already exists');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Insert the new admin into the database
    await db.query(
      'INSERT INTO users (name, email, password, is_admin) VALUES (?, ?, ?, 1)', // 1 for is_admin
      [name, email, hashedPassword]
    );

    res.send('✅ Admin created: Email = admin@grindsphere.com | Password = admin123');
  } catch (error) {
    console.error(error);
    res.status(500).send('❌ Error creating admin');
  }
});

module.exports = router;


