const mongoose = require("mongoose")
const { Schema } = mongoose

const quotationVatSchema = new Schema(
    {
        order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
        customer: { type: Object },
        products: { type: Array, default: [] },
        from: { type: Object },
        head: { type: String, default: "ใบเสนอราคา" },
        head_eng: { type: String, default: "Quotation" },
        no : { type: String },
        date: { type: String, default: "" },
        due_date: { type: String, default: "" },
        dueDateChecked: { type: Boolean, default: false },
        payment_term: { type: String, default: "" },
        credit: { type: Number, default: 0 },
        summary: { type: Array, default: [] },
        remark: { type: String, default: "" },
        payment: { type: String, default: "" },
        color: { type: String, default: "bg-yellow-200" },
        doc_type: { type: String, default: "ฉบับร่าง" },
        signation: { type: Object },
        isWithholding: { type: Boolean, defailt: false },
        withholding_percent: { type: Number, default: null },
        withholding_price: { type: Number, default: 0 }
    },
    {
        timestamps: true
    }
)

const QuotationVat = mongoose.model("QuotationVat", quotationVatSchema)
module.exports = QuotationVat