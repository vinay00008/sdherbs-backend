const multer = require('multer');
const path = require('path');

// Use local storage temporarily
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        console.log('Multer processing file:', file.originalname, file.mimetype);
        cb(null, true);
    }
});

module.exports = upload;
