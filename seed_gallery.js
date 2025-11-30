const mongoose = require('mongoose');
const Gallery = require('./models/Gallery');
require('dotenv').config();

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const testItem = new Gallery({
            image: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg', // Use a public demo image
            caption: 'Verification Image',
            category: 'Verification Event',
            isVisible: true
        });

        await testItem.save();
        console.log('Test gallery item added');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seed();
