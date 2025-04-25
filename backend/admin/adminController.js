const db = require('../db'); // Assuming you're using a DB config

exports.getAllUsers = (req, res) => {
    db.query('SELECT * FROM users', (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
};

exports.getAllServices = (req, res) => {
    db.query('SELECT * FROM services', (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
};
