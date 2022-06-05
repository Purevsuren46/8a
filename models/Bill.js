const mongoose = require("mongoose");

const BillSchema = new mongoose.Schema(
  {
    goods: [{
        good: {
            type: mongoose.Schema.ObjectId,
            ref: "Good",
        },
        price: {
          type: Number
        },
        quantity: {
          type: Number
        },
        finalPrice: {
          type: Number
        }
    }],
    incomeType: {
      type: String,
      enum: ["Бэлэн", "Зээл"]
    },
    type: {
        type: String,
        enum: ["Орлого", "Зарлага"]
    },
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



module.exports = mongoose.model("Bill", BillSchema);
