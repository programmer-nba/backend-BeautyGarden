const mongoose = require("mongoose");
const { Schema } = mongoose

const childInvoiceSchema = new Schema(
    {
        refInvoice: {
            type: String,
            require: true
        },
        code: {
            type: String,
            require: true
        },
        price:  {
            type: Number,
            require: true
        },
        period: {
            type: Number,
            require: true
        },
        start_date: {
            type: Date,
        },
        end_date: {
            type: Date,
        },
        remark: {
            type: String,
        },
        receipt_ref: {
            type: String,
        }
    },
    {
        timestamps: true
    }
)

const ChildInvoice = mongoose.model("ChildInvoice", childInvoiceSchema)
module.exports = ChildInvoice