const Joi = require("joi");
const mongoose = require("mongoose");

const ReceiptNoVatSchema = new mongoose.Schema({
  receipt: { type: String, required: false }, //เลขที่ใบเสร้จ
  quotation: { type: String, required: false }, //เลขที่ใบเสนอราคา
  invoice: { type: String, required: false }, //เลขที่ใบเเเจ้งหนี้
  receiptNoVat: { type: String, required: false }, //เลขที่ใบเสร้จ
  employee_name: { type: String, required: false }, //คนทำรายการ
  customer_branch: {
    //ข้อมูลธนาคาร
    Branch_company_name: { type: String, required: false, default: "ไม่มี" }, //ชื่อบริษัท
    Branch_company_number: { type: String, required: false, default: "ไม่มี" }, //เลขที่บริษัท
    Branch_company_address: { type: String, required: false, default: "ไม่มี" }, //ที่อยู่บริษัท
    Branch_iden_number:  { type: String, required: false }, //รูปภาพ
    taxnumber: { type: String, required: false, default: "ไม่มี" }, //เลขประจำตัวผู้เสียภาษี
    Branch_tel: { type: String, required: false }, //เบอร์โทรศัพท์
    contact_name: { type: String, required: false, default: "ไม่มี" }, //ที่ผู้ติดต่อ
    contact_number: { type: String, required: false, default: "ไม่มี" }, //เบอร์โทรผู้ติดต่อ
    company_email: { type: String, required: false, default: "ไม่มี" },
  },
  customer_detail: {
    //ข้อมูลของลูกค้า
    tax_id: { type: String, required: false }, //เลขประจำตัวผู้เสียภาษี
    customer_name: { type: String, required: false },
    customer_lastname: { type: String, required: false },
    customer_phone: { type: String, required: false },
    customer_address: { type: String, required: false }, //ที่อยู่ของลูกค้า
    customer_type: { type: String, required: false }, //ประเภทลุกค้า
    customer_email: { type: String, required: false }, //email ลูกค้า
    customer_contact: { type: String, required: false }, //ข้อมูลติดต่อลูกค้า
    customer_contact_number: { type: String, required: false }, //เบอร์โทรติดต่อผู้ประสานงาน
  },
  product_detail: [
    {
      product_id: { type: String, required: false },
      product_text: [{ type: String, required: false }],
      product_name: { type: String, required: false },
      product_amount: { type: Number, required: false },
      product_price: { type: Number, required: false },
      product_logo: { type: String, required: false },
      product_total: { type: Number, required: false }, //ราคารวมสินค้าต่อชิ้น
      unit: String
    },
  ],
  total: { type: Number, required: false }, //ราคารวมสินค้นทั้งหมด
  discount: { type: Number, required: false }, //ส่วนลด
  discount_persen: { type: Number, required: false }, //ส่วนลด เป็นเปอร์เซ็น
  net: { type: Number, required: false }, //ราคารวมหลังหักส่วนลด
  ShippingCost: { type: Number, required: false }, //ค่าจัดส่ง
  Shippingincluded: { type: Number, required: false }, //รวมค่าจัดส่ง
  percen_deducted: { type: Number, required: false }, //เลขเปอร์เซ็น ณ ที่หักจ่าย
  total_deducted: { type: Number, required: false }, //ราคารวมหลักจากหัก ณ ที่จ่าย
  total_end_deducted: { type: Number, required: false }, // ราคารวมหลักจากเอา ราคารวม vat เเล้ว มาลบ กับ ณที่หักจ่าย
  note: { type: String, required: false }, //หมายเหตุ
  sumVat: { type: Boolean, required: false },
  withholding: { type: Boolean, required: false },
  isVat: { type: Boolean, required: false },
  processed: { type: String, required: false }, //ใช้เก็บข้อมูลเลขว่าใช้ซ้ำได้มั้ย
  status: { type: Array, required: false },
  start_date: { type: String, required: false }, //วันที่ออกบิล
  end_date: { type: String, required: false }, //วันที่ต้องจ่ายเงิน
  pay_through: { type: String, required: false }, //ชำระผ่าน
  signature: [
    {
      name: { type: String, required: false, default: "-" }, //ชื่อเจ้าของลายเซ็น
      image_signature: { type: String, required: false, default: "-" }, //รูปภาพลายเซ็น
      position: { type: String, required: false, default: "-" }, //ตำเเหน่งเจ้าของลายเซ็น
    },
  ], 
  remark: [{ type: String, required: false }],
  bank: {
    name: { type: String, required: false, default: "-" }, //ชื่อธนาคาร
    img: { type: String, required: false, default: "-" }, //รูปภาพ
    status: { type: Array, required: false },
    remark_2: { type: String, required: false },
  },
  timestamps: { type: Date, required: false, default: Date.now() },
  transfer: String
});

const ReceiptNoVat = mongoose.model("ReceiptNoVat", ReceiptNoVatSchema);

module.exports = { ReceiptNoVat };
