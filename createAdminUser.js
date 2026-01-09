require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const connectDB = require('./config/db');

const createAdmin = async () => {
    try {
        await connectDB();

        const email = 'admin@sdherbs.com';
        const password = 'admin123';

        const exists = await Admin.findOne({ email });
        if (exists) {
            console.log(`Admin user found: ${email}`);
            // Update password just in case
            exists.password = password;
            await exists.save();
            console.log(`✅ Admin password reset to: ${password}`);
        } else {
            await Admin.create({
                name: 'Super Admin',
                email,
                password,
                role: 'admin',
                isActive: true
            });
            console.log(`✅ Admin created successfully`);
            console.log(`Email: ${email}`);
            console.log(`Password: ${password}`);
        }

        process.exit();
    } catch (err) {
        console.error('❌ Error creating/resetting admin:', err);
        process.exit(1);
    }
};

createAdmin();
