const Joi = require("joi");
const mongoose = require("mongoose");

const ReceiptNoVatSchema = new mongoose.Schema({
  receipt: { type: String, required: false }, //เลขที่ใบเสร้จ
  quotation: { type: String, required: false }, //เลขที่ใบเสนอราคา
  invoice: { type: String, required: false }, //เลขที่ใบเเเจ้งหนี้
  receiptNoVat: { type: String, required: false }, //เลขที่ใบเสร้จ
  employee_name: { type: String, required: false }, //คนทำรายการ
  customer_detail: {
    //ข้อมูลของลูกค้า
    tax_id: { type: String, required: false },//เลขประจำตัวผู้เสียภาษี
    customer_name: { type: String, required: false },
    customer_lastname: { type: String, required: false },
    customer_phone: { type: String, required: false },
    customer_address: { type: String, required: false }, //ที่อยู่ของลูกค้า
    customer_type: { type: String, required: false }, //ประเภทลุกค้า
    customer_email: { type: String, required: false }, //email ลูกค้า
  },
  product_detail: [
    {
      product_id: { type: String, required: false },
      product_name: { type: String, required: false },
      product_amount: { type: Number, required: false },
      product_price: { type: Number, required: false },
      product_logo: { type: String, required: false },
      product_total: { type: Number, required: false }, //ราคารวมสินค้าต่อชิ้น
    },
  ],
  total: { type: Number, required: false }, //ราคารวมสินค้นทั้งหมด
  discount: { type: Number, required: false }, //ส่วนลด
  discount_persen :{ type: Number, required: false }, //ส่วนลด เป็นเปอร์เซ็น
  net: { type: Number, required: false }, //ราคารวมหลังหักส่วนลด
  ShippingCost: { type: Number, required: false }, //ค่าจัดส่ง
  Shippingincluded: { type: Number, required: false }, //รวมค่าจัดส่ง
  note: { type: String, required: false }, //หมายเหตุ
  processed: { type: String, required: false }, //ใช้เก็บข้อมูลเลขว่าใช้ซ้ำได้มั้ย
  status: { type: Array, required: false },
  start_date: { type: String, required: false },//วันที่ออกบิล
  end_date: { type: String, required: false },//วันที่ต้องจ่ายเงิน
  timestamps: { type: Date, required: false, default: Date.now() },
});

const ReceiptNoVat = mongoose.model("ReceiptNoVat", ReceiptNoVatSchema);

module.exports = { ReceiptNoVat };
