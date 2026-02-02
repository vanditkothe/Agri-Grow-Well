import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      default: "default_user",
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    date: {
      type: Date,
      required: true,
      index: true
    },
    type: {
      type: String,
      required: true,
      enum: ["health", "farming"],
      lowercase: true
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

// Compound index for efficient queries
eventSchema.index({ userId: 1, date: 1 });
eventSchema.index({ userId: 1, type: 1 });

const Event = mongoose.model("Event", eventSchema);

export default Event;