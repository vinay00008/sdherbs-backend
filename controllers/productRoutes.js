const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', ctrl.getAll);
router.post('/', protect, upload.single('image'), ctrl.create);
router.put('/:id', protect, upload.single('image'), ctrl.update);
router.delete('/:id', protect, ctrl.remove);

module.exports = router;
