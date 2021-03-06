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
    number: {
      type: String,
    },
    finalPrice: {
      type: Number,
      default: 0
    },
    loanPhone: {
      type: Number,
    },
    loanSize: {
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

BillSchema.pre("remove", async function (next) {

  const transaction = await this.model('Transaction').deleteMany({bill: this._id})

  next()
});



module.exports = mongoose.model("Bill", BillSchema);
