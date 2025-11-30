const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { protect } = require("../middleware/authMiddleware");
const {
  getActivities,
  getActivityById,
  createActivity,
  updateActivity,
  deleteActivityPhoto,
  deleteActivity,
} = require("../controllers/activityController");

// temp upload folder
const upload = multer({ dest: path.join(__dirname, "../uploads/") });

router.get("/", getActivities);
router.get("/:id", getActivityById);
router.post("/", protect, upload.array("images", 10), createActivity);
router.put("/:id", protect, upload.array("images", 10), updateActivity);
router.delete("/:id/photo", protect, deleteActivityPhoto); // Changed to use body for publicId
router.delete("/:id", protect, deleteActivity);

module.exports = router;
