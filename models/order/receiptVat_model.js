const mongoose = require("mongoose")
const { Schema } = mongoose

const receiptVatSchema = new Schema(
    {
        order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
        customer: { type: Object },
        products: { type: Array, default: [] },
        from: { type: Object },
        head: { type: String, default: "ใบเสร็จรับเงิน" },
        head_eng: { type: String, default: "Receipt" },
        no : { type: String },
        date: { type: String, default: "" },
        due_date: { type: String, default: "" },
        dueDateChecked: { type: Boolean, default: false },
        payment_term: { type: String, default: "" },
        credit: { type: Number, default: 0 },
        summary: { type: Array, default: [] },
        remark: { type: String, default: "" },
        payment: { type: String, default: "" },
        color: { type: String, default: "bg-green-200" },
        doc_type: { type: String, default: "ฉบับร่าง" },
        signation: { type: Object },
        isWithholding: { type: Boolean, defailt: false },
        withholding_percent: { type: Number, default: null },
        withholding_price: { type: Number, default: 0 },
        status: { type: Array, default: [] },
        refer: { type: Array, default: [] },
        type: { type: String, default: "receipt" }
    },
    {
        timestamps: true
    }
)

const ReceiptVat = mongoose.model("ReceiptVatNew", receiptVatSchema)
module.exports = ReceiptVat