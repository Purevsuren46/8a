const mongoose = require("mongoose")
const PhoneSchema = new mongoose.Schema({
    phone: {
        type: Number,
    },
    random: {
        type: Number,
    },
    newPhone: {
        type: Number,
    },
}, {toJSON: { virtuals: true}, toObject: {virtuals: true}})



module.exports = mongoose.model("Phone", PhoneSchema)