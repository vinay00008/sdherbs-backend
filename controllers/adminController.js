// const Admin = require('../models/Admin');
// const jwt = require('jsonwebtoken');

// const generateToken = (admin) => {
//   // include role & id in token payload - keep it minimal
//   return jwt.sign(
//     { id: admin._id.toString(), role: admin.role },
//     process.env.JWT_SECRET,
//     { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
//   );
// };

// // POST /api/admin/register
// // Only an authenticated admin can create another admin (protect middleware must run)
// exports.register = async (req, res) => {
//   try {
//     // ensure requester is authenticated admin
//     if (!req.admin) {
//       return res.status(401).json({ message: 'Not authorized' });
//     }

//     // optional: check role if you want role-based control
//     if (req.admin.role !== 'admin') {
//       return res.status(403).json({ message: 'Insufficient privileges' });
//     }

//     const { name, email, password } = req.body;
//     if (!name || !email || !password)
//       return res.status(400).json({ message: 'Name, email and password required' });

//     const exists = await Admin.findOne({ email: email.toLowerCase().trim() });
//     if (exists) return res.status(400).json({ message: 'Admin already exists' });

//     const admin = await Admin.create({ name, email: email.toLowerCase().trim(), password });
//     const token = generateToken(admin);

//     res.status(201).json({
//       id: admin._id,
//       name: admin.name,
//       email: admin.email,
//       role: admin.role,
//       token,
//     });
//   } catch (err) {
//     console.error('Admin register error:', err);
//     res.status(500).json({ message: err.message });
//   }
// };

// // POST /api/admin/login
// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

//     const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
//     if (!admin) return res.status(401).json({ message: 'Invalid credentials' });

//     const match = await admin.matchPassword(password);
//     if (!match) return res.status(401).json({ message: 'Invalid credentials' });

//     const token = generateToken(admin);
//     res.json({
//       id: admin._id,
//       name: admin.name,
//       email: admin.email,
//       role: admin.role,
//       token,
//     });
//   } catch (err) {
//     console.error('Admin login error:', err);
//     res.status(500).json({ message: err.message });
//   }
// };

// // GET /api/admin/me
// exports.getProfile = async (req, res) => {
//   try {
//     if (!req.admin) return res.status(401).json({ message: 'Not authorized' });
//     const admin = req.admin;
//     res.json({ id: admin._id, name: admin.name, email: admin.email, role: admin.role });
//   } catch (err) {
//     console.error('Get profile error:', err);
//     res.status(500).json({ message: err.message });
//   }
// };

const Admin = require("../models/Admin");
const jwt = require("jsonwebtoken");

const generateToken = (admin) => {
  return jwt.sign(
    { id: admin._id, role: admin.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );
};

// ===========================
// 🟢 REGISTER NEW ADMIN
// ===========================
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const exists = await Admin.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "Admin already exists" });

    const admin = await Admin.create({ name, email, password });
    res.json({
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ===========================
// 🔐 LOGIN ADMIN
// ===========================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin)
      return res.status(401).json({ message: "Invalid credentials" });

    const match = await admin.matchPassword(password);
    if (!match)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken(admin);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      token,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ===========================
// 👤 PROFILE
// ===========================
exports.getProfile = async (req, res) => {
  try {
    const admin = req.admin;
    res.json({
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ===========================
// 🚪 LOGOUT
// ===========================
exports.logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
    });
    res.json({ message: "Logged out" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ===========================
// ⚙️ SETTINGS PAGE CONTROLS
// ===========================

// Get all admins
exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find({}, "name email isActive role createdAt");
    res.json(admins);
  } catch (err) {
    console.error("Error fetching admins:", err);
    res.status(500).json({ message: "Error fetching admins" });
  }
};

// Toggle admin active/inactive
exports.toggleAdminStatus = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    admin.isActive = !admin.isActive;
    await admin.save();

    res.json({ message: "Status updated", isActive: admin.isActive });
  } catch (err) {
    console.error("Error toggling admin:", err);
    res.status(500).json({ message: "Error toggling admin status" });
  }
};

// Delete admin
exports.deleteAdmin = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    await Admin.findByIdAndDelete(req.params.id);
    res.json({ message: "Admin deleted successfully" });
  } catch (err) {
    console.error("Error deleting admin:", err);
    res.status(500).json({ message: "Error deleting admin" });
  }
};
