const mongoose = require("mongoose");

const BillSchema = new mongoose.Schema(
  {
    transactions: [{
        transactionId: {
            type: mongoose.Schema.ObjectId,
            ref: "Transaction",
        },
    }],
    incomeType: {
      type: String,
      enum: ["Бэлэн", "Зээл"]
    },
    loanName: {
      type: String,
    },
    loanPhone: {
      type: Number,
    },
    loanDate: {
      type: Date,
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
