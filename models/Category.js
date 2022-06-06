const mongoose = require("mongoose");
const { transliterate, slugify } = require("transliteration");

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      maxlength: [
        50,
        "Категорийн нэрний урт дээд тал нь 50 тэмдэгт байх ёстой.",
      ],
    },
    slug: String,
    description: {
      type: String,
    },
    photo: {
      type: String,
      default: "no-photo.jpg",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

CategorySchema.virtual("books", {
  ref: "Book",
  localField: "_id",
  foreignField: "category",
  justOne: false,
});





module.exports = mongoose.model("Category", CategorySchema);
