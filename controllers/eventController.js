const Event = require("../models/Event");

// 🟢 Create new Event
exports.createEvent = async (req, res) => {
  try {
    const { title, description, date } = req.body;

    // ✅ Basic validation
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const newEvent = new Event({
      title,
      description,
      date,
      image: req.file ? `/uploads/${req.file.filename}` : null,
    });

    await newEvent.save();
    res.status(201).json({
      message: "✅ Event created successfully",
      event: newEvent,
    });
  } catch (err) {
    console.error("❌ Error creating event:", err);
    res.status(500).json({ error: err.message });
  }
};

// 🟡 Get all Events
exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.status(200).json(events);
  } catch (err) {
    console.error("❌ Error fetching events:", err);
    res.status(500).json({ error: err.message });
  }
};

// 🟢 Update Event
exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedEvent = await Event.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updatedEvent) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.status(200).json({
      message: "✅ Event updated successfully",
      event: updatedEvent,
    });
  } catch (err) {
    console.error("❌ Error updating event:", err);
    res.status(500).json({ error: err.message });
  }
};

// 🔴 Delete Event
exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedEvent = await Event.findByIdAndDelete(id);

    if (!deletedEvent) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.status(200).json({ message: "🗑️ Event deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting event:", err);
    res.status(500).json({ error: err.message });
  }
};

// 👁️ Toggle Visibility
exports.toggleVisibility = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id);

    // ✅ Safety check: event exist?
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    event.isVisible = !event.isVisible;
    await event.save();

    res.status(200).json({
      message: "👁️ Event visibility updated",
      id: event._id,
      isVisible: event.isVisible,
    });
  } catch (err) {
    console.error("❌ Error toggling visibility:", err);
    res.status(500).json({ error: err.message });
  }
};
