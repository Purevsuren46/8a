const mongoose = require("mongoose");

const TemplateSchema = new mongoose.Schema(
  {
    name: {
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



module.exports = mongoose.model("Template", TemplateSchema);
