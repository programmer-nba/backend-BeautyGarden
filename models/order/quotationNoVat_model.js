const mongoose = require("mongoose")
const { Schema } = mongoose

const quotationNoVatSchema = new Schema(
    {
        order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
        customer: { type: Object },
        products: { type: Array, default: [] },
        header: { type: Object },
        head: { type: String, default: "ใบเสนอราคา" },
        head_eng: { type: String, default: "Quotation" },
        no : { type: String },
        date: { type: String, default: "" },
        due_date: { type: String, default: "" },
        payment_term: { type: String, default: "" },
        credit: { type: Number, default: 0 },
        summary: { type: Array, default: [] },
        remark: { type: String, default: "" },
        payment: { type: String, default: "" },
        color: { type: String, default: "bg-yellow-200" },
        doc_type: { type: String, default: "ฉบับร่าง" },
        signation: { type: Object },
    },
    {
        timestamps: true
    }
)

const QuotationNoVat = mongoose.model("QuotationNoVat", quotationNoVatSchema)
module.exports = QuotationNoVat