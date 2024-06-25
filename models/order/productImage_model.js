const mongoose = require("mongoose")
const { Schema } = mongoose

const productImageSchema = new Schema(
    {
        url: { type: String, require: true }
    },
    {
        timestamps: false
    }
)

const ProductImage = mongoose.model("ProductImage", productImageSchema)
module.exports = ProductImage