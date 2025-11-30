const mongoose = require('mongoose');
const Product = require('./models/Product');
const Category = require('./models/Category');
require('dotenv').config();

const checkData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const categories = await Category.find({});
        console.log('Categories:', categories);

        const products = await Product.find({});
        console.log('Products:', products);

        // Check aggregation manually
        const agg = await Category.aggregate([
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: 'category',
                    as: 'products'
                }
            },
            {
                $addFields: {
                    productCount: { $size: '$products' }
                }
            },
            {
                $project: {
                    name: 1,
                    productCount: 1
                }
            }
        ]);
        console.log('Aggregation Result:', agg);

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkData();
