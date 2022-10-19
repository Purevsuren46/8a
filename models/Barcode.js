const mongoose = require("mongoose");

const BarcodeSchema = new mongoose.Schema(
  {
    createUser: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    barcode: {
      type: Number,
    },
    count: {
        type: Number,
        default: 1
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

module.exports = mongoose.model("Barcode", BarcodeSchema);