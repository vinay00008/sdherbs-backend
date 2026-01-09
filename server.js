require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

// Routes
const adminRoutes = require('./routes/adminRoutes');
const sectionRoutes = require('./routes/sectionRoutes');
const productRoutes = require('./routes/productRoutes');
const eventRoutes = require('./routes/eventRoutes');
const newsRoutes = require('./routes/newsRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const blogRoutes = require('./routes/blogRoutes');
const activityRoutes = require("./routes/activityRoutes");

const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

// Connect MongoDB
connectDB();

const app = express();

// Trust Proxy for Render/Vercel
app.set('trust proxy', 1);

// Security & Performance Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow images to be loaded from other origins if needed
}));
app.use(compression());

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 2000, // Increased for dev/admin usage
    message: "Too many requests from this IP, please try again later."
});
app.use('/api', limiter);

// Middlewares
app.use(cors({
    origin: [
        process.env.CLIENT_URL,
        "http://localhost:3000",
        "http://localhost:5173"
    ],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static('uploads')); // Serve uploaded files

// Base API Route
app.get("/api", (req, res) => {
    res.status(200).json({
        success: true,
        message: "API is running"
    });
});

// API Routes
app.use('/api/admin', adminRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/enquiries', require('./routes/enquiryRoutes'));
app.use('/api/events', eventRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/chatbot', require('./routes/chatRoutes'));
app.use('/api/chat-trainer', require('./routes/chatTrainerRoutes'));
app.use('/api/page-content', require('./routes/pageContentRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/voice', require('./routes/elevenlabsRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
