const mongoose = require("mongoose");
const { transliterate, slugify } = require("transliteration");

const GoodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      maxlength: [250, "Номын нэрний урт дээд тал нь 250 тэмдэгт байх ёстой."],
    },
    photo: {
      type: String,
      default: "no-photo.jpg",
    },
    barCode: {
      type: String,
    },
    price: {
      type: Number
    },
    sellPrice: {
      type: Number
    },
    quantity: {
      type: Number,
      default: 0
    },
    finalPrice: {
      type: Number
    },
    unit: {
      type: String,
      enum: ["кг", "литр", "см", "ширхэг", "мк2", "мк3"]
    },
    expireDay: {
      type: Number
    },
    content: {
      type: String,
      maxlength: [5000, "Номын нэрний урт дээд тал нь 20 тэмдэгт байх ёстой."],
    },
    bestSeller: {
      type: Boolean,
      default: false,
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: "Category",
      required: true,
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

GoodSchema.pre("remove", async function (next) {

  const transaction = await this.model('Transaction').find({good: this._id})

  const trans = []
  for (let i = 0;  i < transaction.length; i++) {
    trans.push(transaction[i].bill)
  }
  await this.model('Transaction').deleteMany({good: this._id})

  await this.model('Bill').deleteMany({_id: trans})
  next()
});

module.exports = mongoose.model("Good", GoodSchema);
