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
      default: "no-photo.jpg",
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

module.exports = mongoose.model("Good", GoodSchema);
