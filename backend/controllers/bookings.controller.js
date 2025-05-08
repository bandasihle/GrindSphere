const db = require('../config/db');

exports.createBooking = (req, res, next) => {
  const { customer_id, service_id } = req.body;

  const sql = 'INSERT INTO bookings (customer_id, service_id) VALUES (?, ?)';
  db.query(sql, [customer_id, service_id], (err, result) => {
    if (err) return next(err);
    res.status(201).json({ message: 'Booking successful', bookingId: result.insertId });
  });
};

exports.getBookings = (req, res, next) => {
  const customerId = req.query.customerId;

  const sql = `
    SELECT b.id AS bookingId, s.title, s.category, s.price, s.description, b.booking_time, b.status
    FROM bookings b
    JOIN services s ON b.service_id = s.id
    WHERE b.customer_id = ?
    ORDER BY b.booking_time DESC
  `;

  db.query(sql, [customerId], (err, results) => {
    if (err) return next(err);
    res.json(results);
  });
};

exports.deleteBooking = (req, res, next) => {
  const bookingId = req.params.id;

  const sql = 'DELETE FROM bookings WHERE id = ?';
  db.query(sql, [bookingId], (err, result) => {
    if (err) return next(err);
    res.json({ message: 'Booking cancelled successfully' });
  });
};