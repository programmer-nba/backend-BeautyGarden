const Joi = require("joi");
const mongoose = require("mongoose");

const InvoiceSchema = new mongoose.Schema({
  invoice: { type: String, required: false }, //เลขที่ใบเเจ้งหนี
  quotation: { type: String, required: false }, //เลขที่ใบเสนอราคา
  employee_name: { type: String, required: false }, //คนทำรายการ
  customer_branch: {
    //ข้อมูลธนาคาร
    Branch_company_name: { type: String, required: false, default: "ไม่มี" }, //ชื่อบริษัท
    Branch_company_number: { type: String, required: false, default: "ไม่มี" }, //เลขที่บริษัท
    Branch_company_address: { type: String, required: false, default: "ไม่มี" }, //ที่อยู่บริษัท
    Branch_iden_number: { type: String, required: false }, //รูปภาพ
    taxnumber: { type: String, required: false, default: "ไม่มี" }, //เลขประจำตัวผู้เสียภาษี
    Branch_tel: { type: String, required: false }, //เบอร์โทรศัพท์
    contact_name: { type: String, required: false, default: "ไม่มี" }, //ที่ผู้ติดต่อ
    contact_number: { type: String, required: false, default: "ไม่มี" }, //เบอร์โทรผู้ติดต่อ
    company_email: { type: String, required: false, default: "ไม่มี" },
    isVat: { type: Boolean, required: false },
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
  isSign: Boolean,
  product_head: String,
  product_detail: [
    {
      product_id: { type: String, required: false },
      product_text: [{ type: String, required: false }],
      product_name: { type: String, required: false },
      product_amount: { type: Number, required: false },
      product_price: { type: Number, required: false },
      product_logo: [{ type: String, required: false }],
      vat_price: { type: Number, required: false },
      product_total: { type: Number, required: false }, //ราคารวมสินค้าต่อชิ้น
      unit: String
    },
  ],
  total: { type: Number, required: false }, //ราคารวมสินค้นทั้งหมด
  discount: { type: Number, required: false }, //ส่วนลด เป็นบาท
  discount_persen: { type: Number, required: false }, //ส่วนลด เป็นเปอร์เซ็น
  net: { type: Number, required: false }, //ราคารวมหลังหักส่วนลด
  vat: {
    amount_vat: { type: Number, required: false }, //vat 7%
    totalvat: { type: Number, required: false }, //ราคาหลังรวม vat
    ShippingCost: { type: Number, required: false }, //ค่าจัดส่ง
    Shippingincluded: { type: Number, required: false }, //รวมคารวมจัดส่ง
    percen_deducted: { type: Number, required: false }, //เลขเปอร์เซ็น ณ ที่หักจ่าย
    total_deducted: { type: Number, required: false }, //ราคารวมหลักจากหัก ณ ที่จ่าย
    totalVat_deducted: { type: Number, required: false }, // ราคารวมหลักจากเอา ราคารวม vat เเล้ว มาลบ กับ ณที่หักจ่าย
  },
  total_products: {
    amount_vat: { type: Number, required: false }, //หาค่าจริงของสินค้า
    total_product: { type: Number, required: false }, //ราคาหลังหัก
    total_discount: { type: Number, required: false }, //เปอร์เซ็นหักจ่าย
    ShippingCost1: { type: Number, required: false }, //ราคาขนส่ง
    total_ShippingCost1: { type: Number, required: false }, //ราคารวมหลังจากขนส่ง
    percen_payment: { type: Number, required: false }, //เปอร์เซ็นหักจ่าย
    after_discoun_payment: { type: Number, required: false }, //ราคาหลังหักจ่าย
    total_all_end: { type: Number, required: false }, //ราคารวมหลังหัก ณ ที่ จ่าย
  },
  signature: [
    {
      name: { type: String, required: false, default: "-" }, //ชื่อเจ้าของลายเซ็น
      image_signature: { type: String, required: false, default: "-" }, //รูปภาพลายเซ็น
      position: { type: String, required: false, default: "-" }, //ตำเเหน่งเจ้าของลายเซ็น
    },
  ], //เก็บลายเซ็น
  remark: [{ type: String, required: false }],
  bank: {
    name: { type: String, required: false, default: "-" }, //ชื่อธนาคาร
    img: { type: String, required: false, default: "-" }, //รูปภาพ
    status: { type: String, required: false },
    remark_2: { type: String, required: false },
  },
  processed: { type: String, required: false }, //ใช้เก็บข้อมูลเลขว่าใช้ซ้ำได้มั้ย
  sumVat: { type: Boolean, required: false },
  status: { type: Array, required: false },
  start_date: { type: String, required: false }, //วันที่ออกบิล
  end_date: { type: String, required: false }, //วันที่ต้องจ่ายเงิน
  timestamps: { type: Date, required: false, default: Date.now() },
  credit: {type: Number, required: false },
  end_period: {type: Number, required: false },
  cur_period: {type: Number, required: false },
  isVat: { type: Boolean },
  paid: Number,
  transfer: String,
  header: String
});

const Invoice = mongoose.model("Invoice", InvoiceSchema);

module.exports = { Invoice };
