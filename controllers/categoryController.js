const Category = require('../models/Category');
const Product = require('../models/Product');
const cloudinary = require('../config/cloudinary');

exports.getAll = async (req, res) => {
    try {
        // Aggregate to get categories with product counts
        const categories = await Category.aggregate([
            {
                $lookup: {
                    from: 'products', // collection name in MongoDB (usually lowercase plural of model name)
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
                    products: 0 // Exclude the actual products array to keep response light
                }
            },
            {
                $sort: { createdAt: -1 }
            }
        ]);

        res.json(categories);
    } catch (err) {
        console.error("Error fetching categories:", err);
        res.status(500).json({ message: err.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { name, description } = req.body;
        const category = new Category({ name, description });
        await category.save();
        res.status(201).json(category);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Find all products in this category
        const products = await Product.find({ category: id });

        // 2. Delete images from Cloudinary for each product
        for (const product of products) {
            if (product.images && product.images.length > 0) {
                const imageUrl = product.images[0];
                if (imageUrl.includes('cloudinary')) {
                    const publicId = imageUrl.split('/').slice(-2).join('/').split('.')[0];
                    await cloudinary.uploader.destroy(publicId);
                }
            }
        }

        // 3. Delete all products
        await Product.deleteMany({ category: id });

        // 4. Delete the category
        await Category.findByIdAndDelete(id);

        res.json({ message: 'Category and all associated products deleted successfully' });
    } catch (err) {
        console.error("Error deleting category:", err);
        res.status(500).json({ message: err.message });
    }
};
