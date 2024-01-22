const Joi = require("joi");
const mongoose = require("mongoose");

const QuotationSchema = new mongoose.Schema({
  invoice : {type: String, required: false,},//เลขที่ใบเวนอราคา
  employee_name: {type: String, required: false},//คนทำรายการ
  customer_detail: {//ข้อมูลของลูกค้า
    customer_name: {type: String, required: false},
    customer_phone: {type: String, required: false},
    customer_address: {type: String, required: false},//ที่อยู่ของลูกค้า
    customer_type: {type: String, required: false},//ประเภทลุกค้า
},
  product_detail: {
        product_id: {type: String, required: false},
        product_name: {type: String, required: false},
        product_amount: {type: Number, required: false},
        product_price: {type: Number, required: false},
        product_logo: {type: String, required: false},
        product_total: {type: String, required: false}, //ราคารวมสินค้าต่อชิ้น
  },
  total: {type: String, required: false}, //ราคารวมสินค้นทั้งหมด
  processed: {type: String, required: false,},//ใช้เก็บข้อมูลเลขว่าใช้ซ้ำได้มั้ย
  status: {type: Array, required: false,},
  timestamps: {type: Date, required: false, default: Date.now()},
});

const Quotation = mongoose.model("Quotation", QuotationSchema);

module.exports = {Quotation};
