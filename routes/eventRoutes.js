const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  createEvent,
  getEvents,
  updateEvent,
  deleteEvent,
  toggleVisibility,
} = require("../controllers/eventController");

// 🧩 File upload setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// 🌿 Routes
router.post("/", upload.single("image"), createEvent);
router.get("/", getEvents);
router.put("/:id", upload.single("image"), updateEvent);
router.delete("/:id", deleteEvent);
router.patch("/:id/toggle", toggleVisibility);

module.exports = router;
