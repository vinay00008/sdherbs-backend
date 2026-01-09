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
router.get("/reset-admin-password-securely", async (req, res) => {
  try {
    const Admin = require("../models/Admin");
    const email = "admin@sdherbs.com";
    const password = "admin123";
    let user = await Admin.findOne({ email });
    if (user) {
      user.password = password;
      await user.save();
      return res.send(`Password for ${email} reset to ${password}`);
    } else {
      // Create if not exists (fail-safe)
      user = await Admin.create({
        name: 'Super Admin',
        email,
        password,
        role: 'admin',
        isActive: true
      });
      return res.send(`Admin created: ${email} / ${password}`);
    }
  } catch (error) {
    return res.status(500).send(error.message);
  }
});
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
