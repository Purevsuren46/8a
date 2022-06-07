const mongoose = require("mongoose");

const CollectionSchema = new mongoose.Schema(
  {
    goods: [{
        goodId: {
            type: mongoose.Schema.ObjectId,
            ref: "Good",
        }
    }],
    createUser: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);



module.exports = mongoose.model("Collection", CollectionSchema);
