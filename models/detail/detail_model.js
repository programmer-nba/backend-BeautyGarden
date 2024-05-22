const mongoose = require("mongoose")
const { Schema } = mongoose

const detailSchema = new Schema(
    {
        quotation: String,
        invoice: String,
        receipt: String,
        name: String,
        subName: String,
        discount: { type: Number, default: 0 },
        netPrice: { type: Number, default: 0 },
        beforeVat: { type: Number, default: 0 },
        afterVat: { type: Number, default: 0 },
        vatPrice: { type: Number, default: 0 },
        amount: { type: Number, default: 1 },
        unit: String,
        vatType: { type: String, enum: ["noVat", "includeVat", "outerVat"], default: "none" },
        prods: [
            {
                product_no: Number,
                product_id: { type: String, required: false },
                product_text: [{ type: String, required: false }],
                product_text_no: Number,
                product_name: { type: String, required: false },
                product_amount: { type: Number, required: false },
                product_price: { type: Number, required: false },
                product_head: String,
                product_logo: [{ type: String, required: false }],
                vat_price: { type: Number, required: false },
                product_total: { type: Number, required: false },
                unit: String
            }
        ],
    },
    {
        timestamps: true
    }
)

const Detail = mongoose.model("Detail", detailSchema)
module.exports = Detail