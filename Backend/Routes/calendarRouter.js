import express from "express";
import Event from '../Models/Event.js';

const router = express.Router();

// Get all events for a user
router.get("/events", async (req, res) => {
  try {
    const userId = req.query.userId || "default_user"; // In production, get from auth token
    
    const events = await Event.find({ userId }).sort({ date: 1 });
    
    res.json({
      success: true,
      events,
      count: events.length
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch events",
      details: error.message
    });
  }
});

// Get events for a specific date
router.get("/events/date/:date", async (req, res) => {
  try {
    const userId = req.query.userId || "default_user";
    const targetDate = new Date(req.params.date);
    
    // Set to start and end of day
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
    
    const events = await Event.find({
      userId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });
    
    res.json({
      success: true,
      events,
      date: req.params.date
    });
  } catch (error) {
    console.error("Error fetching events by date:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch events for date",
      details: error.message
    });
  }
});

// Get upcoming events
router.get("/events/upcoming", async (req, res) => {
  try {
    const userId = req.query.userId || "default_user";
    const limit = parseInt(req.query.limit) || 5;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const events = await Event.find({
      userId,
      date: { $gte: today }
    })
    .sort({ date: 1 })
    .limit(limit);
    
    res.json({
      success: true,
      events,
      count: events.length
    });
  } catch (error) {
    console.error("Error fetching upcoming events:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch upcoming events",
      details: error.message
    });
  }
});

// Create a new event
router.post("/events", async (req, res) => {
  try {
    const userId = req.body.userId || "default_user";
    const { title, date, type, description } = req.body;
    
    if (!title || !date || !type) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: title, date, and type are required"
      });
    }
    
    if (!["health", "farming"].includes(type)) {
      return res.status(400).json({
        success: false,
        error: "Invalid event type. Must be 'health' or 'farming'"
      });
    }
    
    const newEvent = new Event({
      userId,
      title,
      date: new Date(date),
      type,
      description: description || ""
    });
    
    await newEvent.save();
    
    res.status(201).json({
      success: true,
      message: "Event created successfully",
      event: newEvent
    });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create event",
      details: error.message
    });
  }
});

// Update an event
router.put("/events/:id", async (req, res) => {
  try {
    const userId = req.body.userId || "default_user";
    const { title, date, type, description } = req.body;
    
    const event = await Event.findOne({
      _id: req.params.id,
      userId
    });
    
    if (!event) {
      return res.status(404).json({
        success: false,
        error: "Event not found"
      });
    }
    
    if (title) event.title = title;
    if (date) event.date = new Date(date);
    if (type && ["health", "farming"].includes(type)) event.type = type;
    if (description !== undefined) event.description = description;
    
    await event.save();
    
    res.json({
      success: true,
      message: "Event updated successfully",
      event
    });
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update event",
      details: error.message
    });
  }
});

// Delete an event
router.delete("/events/:id", async (req, res) => {
  try {
    const userId = req.query.userId || "default_user";
    
    const event = await Event.findOneAndDelete({
      _id: req.params.id,
      userId
    });
    
    if (!event) {
      return res.status(404).json({
        success: false,
        error: "Event not found"
      });
    }
    
    res.json({
      success: true,
      message: "Event deleted successfully",
      event
    });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete event",
      details: error.message
    });
  }
});

// Get event statistics
router.get("/events/stats", async (req, res) => {
  try {
    const userId = req.query.userId || "default_user";
    
    const totalEvents = await Event.countDocuments({ userId });
    const healthEvents = await Event.countDocuments({ userId, type: "health" });
    const farmingEvents = await Event.countDocuments({ userId, type: "farming" });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const upcomingEvents = await Event.countDocuments({
      userId,
      date: { $gte: today }
    });
    
    res.json({
      success: true,
      stats: {
        total: totalEvents,
        health: healthEvents,
        farming: farmingEvents,
        upcoming: upcomingEvents
      }
    });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch statistics",
      details: error.message
    });
  }
});

export default router;