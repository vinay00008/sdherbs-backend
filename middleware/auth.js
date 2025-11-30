const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  const authHeader = req.header('Authorization') || req.header('authorization');
  const token = authHeader ? authHeader.split(' ')[1] : null;
  if(!token) return res.status(401).json({ msg: 'No token, auth denied' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // contains id, email, role
    next();
  } catch (err) {
    return res.status(401).json({ msg: 'Token not valid' });
  }
};
