const mongoose = require("mongoose")

const PurchaseOrderSupSchema = new mongoose.Schema({
  code: { type: String, required: false },
  supplier_detail: {
    supplier_tel: { type: String, required: false },
    supplier_status: { type: Boolean, required: false },
    supplier_company_name: { type: String, required: false }, 
    supplier_company_number: { type: String, required: false }, 
    supplier_company_address: { type: String, required: false },
    supplier_type: { type: String, required: false }
  },
  product_detail: [
    {
      product_text: { type: String, required: false },
      product_name: { type: String, required: false },
      product_amount: { type: Number, required: false },
      product_price: { type: Number, required: false },
      product_total: { type: Number, required: false },
      product_cost_type: { type: String, required: false },
      isVat: Boolean,
      vat: { type: Number, required: false },
      sumVat: Boolean,
      unit: String
    },
  ],
  total: { type: Number, required: false },
  discount: { type: Number, required: false },
  net: { type: Number, required: false },
  total_vat: Number,
  date: Date,
  bill_img: String,
  note: String,
  timestamps: { type: Date, required: false, default: Date.now() },
});

const PurchaseOrderSup = mongoose.model(
  "PurchaseOrderSup",
  PurchaseOrderSupSchema
);

module.exports = { PurchaseOrderSup };
