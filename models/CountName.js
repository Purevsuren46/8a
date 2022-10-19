const mongoose = require("mongoose");

const CountNameSchema = new mongoose.Schema(
  {
    createUser: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    name: {
      type: String,
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);



module.exports = mongoose.model("CountName", CountNameSchema);