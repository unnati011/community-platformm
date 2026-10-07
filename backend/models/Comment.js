const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true },
  problem: { type: mongoose.Schema.Types.ObjectId, ref: "Problem", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

module.exports = mongoose.model("Comment", commentSchema);
