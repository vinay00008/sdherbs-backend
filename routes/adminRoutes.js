const express = require("express");
const router = express.Router();
const adminCtrl = require("../controllers/adminController");
const { protect } = require("../middleware/authMiddleware");

// Models for stats
const Event = require("../models/Event");
const News = require("../models/News");
const Gallery = require("../models/Gallery");
const Blog = require("../models/Blog");
const Product = require("../models/Product");

// =============================
// 🔐 AUTH ROUTES
// =============================
router.post("/login", adminCtrl.login);
router.post("/logout", adminCtrl.logout);
router.get("/me", protect, adminCtrl.getProfile);

// =============================
// ⚙️ ADMIN MANAGEMENT
// =============================

// Register (only logged-in admin)
router.post("/register", protect, adminCtrl.register);

// Get all admins
router.get("/list", protect, adminCtrl.getAllAdmins);

// Toggle admin active/inactive
router.patch("/:id/toggle", protect, adminCtrl.toggleAdminStatus);

// Delete admin
router.delete("/:id", protect, adminCtrl.deleteAdmin);

// =============================
// 📊 DASHBOARD STATS
// =============================
router.get("/stats", protect, async (req, res) => {
  try {
    const [events, news, gallery, blogs, products, enquiries] = await Promise.all([
      Event.countDocuments(),
      News.countDocuments(),
      Gallery.countDocuments(),
      Blog.countDocuments(),
      Product.countDocuments(),
      require("../models/Enquiry").countDocuments(),
    ]);
    res.json({ events, news, gallery, blogs, products, enquiries });
  } catch (err) {
    console.error("Error fetching dashboard stats:", err);
    res.status(500).json({ error: "Server Error" });
  }
});

module.exports = router;
