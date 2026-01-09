// const jwt = require('jsonwebtoken');
// const Admin = require('../models/Admin');

// exports.protect = async (req, res, next) => {
//   let token = null;

//   // Try Authorization header first
//   if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
//     token = req.headers.authorization.split(' ')[1];
//   }
//   // Fallback to cookie if you use cookies
//   if (!token && req.cookies && req.cookies.token) {
//     token = req.cookies.token;
//   }

//   if (!token) return res.status(401).json({ message: 'Not authorized, token missing' });

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const admin = await Admin.findById(decoded.id).select('-password');
//     if (!admin) return res.status(401).json({ message: 'Not authorized, admin not found' });
//     req.admin = admin; // attach admin to req
//     next();
//   } catch (err) {
//     console.error('Auth middleware error:', err);
//     return res.status(401).json({ message: 'Not authorized, token invalid/expired' });
//   }
// };


const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

exports.protect = async (req, res, next) => {
  try {
    let token = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, token missing' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id).select('-password');
    if (!admin) return res.status(401).json({ message: 'Not authorized' });

    req.admin = admin;
    next();
  } catch (err) {
    console.error('Auth error:', err);
    return res.status(401).json({ message: 'Not authorized' });
  }
};
