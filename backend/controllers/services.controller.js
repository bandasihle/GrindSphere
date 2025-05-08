const db = require('../config/db');

exports.createService = (req, res, next) => {
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
    if (err) return next(err);
    res.status(201).json({ message: 'Service created successfully', serviceId: result.insertId });
  });
};

exports.getAllServices = async (req, res, next) => {
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
    if (err) return next(err);
    res.json(results);
  });
};

exports.getServiceById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const [rows] = await db.promise().execute('SELECT * FROM services WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Service not found' });
    res.status(200).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.updateService = (req, res, next) => {
  const serviceId = req.params.id;
  const { title, description, price, category, location, image_url } = req.body;

  const sql = `
    UPDATE services 
    SET title = ?, description = ?, price = ?, category = ?, location = ?, image_url = ?
    WHERE id = ?
  `;

  db.query(sql, [title, description, price, category, location, image_url, serviceId], (err, result) => {
    if (err) return next(err);
    res.json({ message: 'Service updated successfully' });
  });
};

exports.deleteService = (req, res, next) => {
  const serviceId = req.params.id;

  const sql = 'DELETE FROM services WHERE id = ?';
  db.query(sql, [serviceId], (err, result) => {
    if (err) return next(err);
    res.json({ message: 'Service deleted successfully' });
  });
};