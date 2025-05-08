const bcrypt = require('bcrypt');
const db = require('../config/db');

exports.signup = async (req, res, next) => {
  const { name, email, password, role, skill } = req.body;

  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, result) => {
    if (err) return next(err);

    if (result.length > 0)
      return res.status(400).json({ message: 'Email is already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const query = 'INSERT INTO users (name, email, password, role, skill) VALUES (?, ?, ?, ?, ?)';

    db.query(query, [name, email, hashedPassword, role, skill || null], (err) => {
      if (err) return next(err);
      res.status(200).json({ message: 'User registered successfully' });
    });
  });
};

exports.login = async (req, res, next) => {
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
    next(err);
  }
};