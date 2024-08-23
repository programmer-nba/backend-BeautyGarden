const mongoose = require("mongoose")
const { Schema } = mongoose

const paymentSchema = new Schema(
    {
        name: { type: String, require: true }
    },
    {
        timestamps: true
    }
)

const PaymentTerm = mongoose.model("_payment_term", paymentSchema)
module.exports = PaymentTerm