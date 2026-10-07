const mongoose = require("mongoose");

const problemSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  location: { type: String, required: true },
  image: { type: String, default: "" },
  status: { type: String, enum: ["Reported", "In Progress", "Resolved"], default: "Reported" },
  likes: { type: Number, default: 0 },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

module.exports = mongoose.model("Problem", problemSchema);
