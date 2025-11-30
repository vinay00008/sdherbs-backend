const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/sectionController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', ctrl.getSections);
router.post('/', protect, ctrl.createSection);
router.put('/:id', protect, ctrl.updateSection);
router.delete('/:id', protect, ctrl.deleteSection);

module.exports = router;
