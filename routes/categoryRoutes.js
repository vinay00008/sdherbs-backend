const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/categoryController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', ctrl.getAll);
router.post('/', protect, ctrl.create);
router.delete('/:id', protect, ctrl.deleteCategory);

module.exports = router;
