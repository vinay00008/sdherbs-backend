require('dotenv').config();
const connectDB = require('./config/db');
const SectionControl = require('./models/SectionControl');

const defaultSections = [
  { name: "Product Launches", key: "product_launches", order: 1, isVisible: true },
  { name: "Events", key: "events", order: 2, isVisible: true },
  { name: "News", key: "news", order: 3, isVisible: true },
  { name: "Gallery", key: "gallery", order: 4, isVisible: true },
  { name: "Blog / Articles", key: "blogs", order: 5, isVisible: true }
];

(async () => {
  try {
    await connectDB();
    await SectionControl.deleteMany();
    await SectionControl.insertMany(defaultSections);
    console.log('✅ Default sections seeded!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
