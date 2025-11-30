const Activity = require("../models/Activity");
const { cloudinary } = require("../config/cloudinary");
const fs = require("fs");

// @desc    Get all activities
// @route   GET /api/activities
// @access  Public
const getActivities = async (req, res) => {
    try {
        const activities = await Activity.find().sort({ createdAt: -1 });
        res.json(activities);
    } catch (err) {
        console.error("Get activities error:", err);
        res.status(500).json({ message: "Server error fetching activities" });
    }
};

// @desc    Get single activity
// @route   GET /api/activities/:id
// @access  Public
const getActivityById = async (req, res) => {
    try {
        const activity = await Activity.findById(req.params.id);
        if (!activity) return res.status(404).json({ message: "Activity not found" });
        res.json(activity);
    } catch (err) {
        console.error("Get activity error:", err);
        res.status(500).json({ message: "Server error fetching activity" });
    }
};

// @desc    Create activity
// @route   POST /api/activities
// @access  Private (Admin)
const createActivity = async (req, res) => {
    try {
        const { title, description, fitMode } = req.body;

        if (!title) {
            if (req.files) req.files.forEach((f) => fs.unlinkSync(f.path));
            return res.status(400).json({ message: "Title is required" });
        }

        const uploadedPhotos = [];

        if (req.files) {
            for (const file of req.files) {
                const result = await cloudinary.uploader.upload(file.path, {
                    folder: "sdherbs/activities",
                });

                uploadedPhotos.push({
                    url: result.secure_url,
                    publicId: result.public_id,
                });

                fs.unlinkSync(file.path);
            }
        }

        const activity = await Activity.create({
            title,
            description,
            fitMode,
            photos: uploadedPhotos,
        });

        res.status(201).json(activity);
    } catch (err) {
        console.error("Create activity error:", err);
        res.status(500).json({ message: "Server error creating activity" });
    }
};

// @desc    Update activity
// @route   PUT /api/activities/:id
// @access  Private (Admin)
const updateActivity = async (req, res) => {
    try {
        const { title, description, fitMode } = req.body;

        const activity = await Activity.findById(req.params.id);
        if (!activity) return res.status(404).json({ message: "Activity not found" });

        activity.title = title || activity.title;
        activity.description = description || activity.description;
        activity.fitMode = fitMode || activity.fitMode;

        // upload new photos (if any)
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const result = await cloudinary.uploader.upload(file.path, {
                    folder: "sdherbs/activities",
                });

                activity.photos.push({
                    url: result.secure_url,
                    publicId: result.public_id,
                });

                fs.unlinkSync(file.path);
            }
        }

        await activity.save();

        res.json({ message: "Activity updated", activity });
    } catch (err) {
        console.error("Update activity error:", err);
        res.status(500).json({ message: "Server error updating activity" });
    }
};

// @desc    Delete single photo
// @route   DELETE /api/activities/:id/photo
// @access  Private (Admin)
const deleteActivityPhoto = async (req, res) => {
    try {
        const { id } = req.params;
        const { publicId } = req.body; // Expect publicId in body for safety

        if (!publicId) return res.status(400).json({ message: "Public ID is required" });

        const activity = await Activity.findById(id);
        if (!activity) return res.status(404).json({ message: "Activity not found" });

        // delete from cloudinary
        try {
            await cloudinary.uploader.destroy(publicId);
        } catch (err) {
            console.log("Cloudinary deletion failed:", publicId);
        }

        // remove from DB list
        activity.photos = activity.photos.filter((p) => p.publicId !== publicId);
        await activity.save();

        res.json({ message: "Photo deleted" });
    } catch (err) {
        console.error("Delete photo error:", err);
        res.status(500).json({ message: "Server error deleting photo" });
    }
};

// @desc    Delete whole activity
// @route   DELETE /api/activities/:id
// @access  Private (Admin)
const deleteActivity = async (req, res) => {
    try {
        const activity = await Activity.findById(req.params.id);
        if (!activity) return res.status(404).json({ message: "Activity not found" });

        for (const photo of activity.photos) {
            await cloudinary.uploader.destroy(photo.publicId);
        }

        await Activity.findByIdAndDelete(req.params.id);

        res.json({ message: "Activity deleted" });
    } catch (err) {
        console.error("Delete activity error:", err);
        res.status(500).json({ message: "Server error deleting activity" });
    }
};

module.exports = {
    getActivities,
    getActivityById,
    createActivity,
    updateActivity,
    deleteActivityPhoto,
    deleteActivity,
};
