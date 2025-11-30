const mongoose = require('mongoose');
const Category = require('./models/Category');
require('dotenv').config();

const seedCategories = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sdherbs');
        console.log('MongoDB Connected');

        const categories = [
            { name: 'Herbal', description: 'Pure herbal products' },
            { name: 'Beauty', description: 'Natural beauty products' },
            { name: 'Wellness', description: 'General wellness items' }
        ];

        for (const cat of categories) {
            const exists = await Category.findOne({ name: cat.name });
            if (!exists) {
                await Category.create(cat);
                console.log(`Created category: ${cat.name}`);
            } else {
                console.log(`Category already exists: ${cat.name}`);
            }
        }

        console.log('Seeding complete');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedCategories();
