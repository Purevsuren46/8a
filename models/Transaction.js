const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema(
  {
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
    },
    balanceGoodNumber: {
      type: Number
    },
    goodName: {
      type: String
    },
    isBasket: {
      type: Boolean,
      default: false
    },
    incomeType: {
      type: String,
      enum: ["Бэлэн", "Зээл"]
    },
    type: {
        type: String,
        enum: ["Орлого", "Зарлага"]
    },
    bill: {
        type: mongoose.Schema.ObjectId,
        ref: "Bill",
    },
    template: {
      type: mongoose.Schema.ObjectId,
      ref: "Template",
  },
  templateName: {
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
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);



module.exports = mongoose.model("Transaction", TransactionSchema);
