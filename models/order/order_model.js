const mongoose = require("mongoose")
const { Schema } = mongoose

const orderSchema = new Schema(
    {
        no: { type: String },
        customer: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
        products: { type: Array, default: [] },
        header: { type: mongoose.Schema.Types.ObjectId, ref: "Header" },
        products_price: { type: Number, default: 0 },
        discount: { type: Number, default: 0 },
        vat_price: { type: Number, default: 0 },
        withholding_price: { type: Number, default: 0 },
        net_price: { type: Number, default: 0 },
        status: { type: Array, default: [] },
    },
    {
        timestamps: true
    }
)

const Order = mongoose.model("Order", orderSchema)
module.exports = Order