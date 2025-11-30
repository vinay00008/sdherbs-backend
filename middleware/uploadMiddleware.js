const multer = require('multer');
const { storage } = require('../config/cloudinary');

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        console.log('Multer processing file:', file.originalname, file.mimetype);
        cb(null, true);
    }
});

module.exports = upload;
