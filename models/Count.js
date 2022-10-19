const mongoose = require("mongoose");

const CountSchema = new mongoose.Schema(
  {
    good: {
      type: mongoose.Schema.ObjectId,
      ref: "Good",
    },
    count: {
      type: Number,
      default: 1
    },
    countNameExplanation: {
      type: String
    },
    createUser: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    countName: {
      type: mongoose.Schema.ObjectId,
      ref: "CountName",
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);



module.exports = mongoose.model("Count", CountSchema);