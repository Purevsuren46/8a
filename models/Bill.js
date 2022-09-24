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
      enum: ["Бэлэн", "Зээл", "Бэлэн бус"]
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
    loanRemaining: {
      type: Number,
    },
    loanDate: {
      type: Date,
    },
    isPaid: {
      type: Boolean,
      default: false
    },
    paidDate: {
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
    deptHistory: [{
      createdAt: {
      type: Date,
      default: Date.now,
      },
      amount: {
        type: Number
      },
      before: {
        type: Number
      }

    }]
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

BillSchema.pre("remove", async function (next) {

  const transaction = await this.model('Transaction').deleteMany({bill: this._id})

  next()
});



module.exports = mongoose.model("Bill", BillSchema);
