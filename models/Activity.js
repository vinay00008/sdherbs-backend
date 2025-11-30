const mongoose = require("mongoose");

const photoSchema = new mongoose.Schema(
  {
    url: String,
    publicId: String
  },
  { _id: false }
);

const activitySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    fitMode: { type: String, default: "contain" }, // ⭐ NEW
    photos: [photoSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Activity", activitySchema);
