const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const servicesController = require('../controllers/services.controller');

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

router.post('/', upload.single('image'), servicesController.createService);
router.get('/', servicesController.getAllServices);
router.get('/:id', servicesController.getServiceById);
router.put('/:id', servicesController.updateService);
router.delete('/:id', servicesController.deleteService);

module.exports = router;