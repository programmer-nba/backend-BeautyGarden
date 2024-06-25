const mongoose = require("mongoose")
const { Schema } = mongoose

const productSchema = new Schema(
    {
        code: { type: String, require: true },
        name: { type: String, default: "" },
        description: { type: String, default: "" },
        images: { type: Array, default: [] },
        unit: { type: String, default: "" },
        type: { type: String, default: "etc" },
        price: { type: Number, default: 0 }
    },
    {
        timestamps: true
    }
)

const Product = mongoose.model("Product", productSchema)
module.exports = Product