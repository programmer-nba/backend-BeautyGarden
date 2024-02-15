const mongoose = require("mongoose");
const Joi = require("joi");

const SupplierSchema = new mongoose.Schema({
  supplier_tel: { type: String, required: false }, //เบอร์โทรศัพท์
  supplier_status: { type: Boolean, required: false, default: true }, //สถานะ

  //บัญชีธนาคาร
  supplier_bookbank: { type: String, required: false, default: "-" }, // images
  supplier_bookbank_name: { type: String, required: false, default: "-" }, //ธนาคาร
  supplier_bookbank_number: { type: String, required: false, default: "-" }, //เลขที่บัญชี

  //บัตรประชาชน
  supplier_iden: { type: String, required: false, default: "-" }, // images
  supplier_iden_number: { type: String, required: false, default: "-" }, //เลขประจำตัวประชาชน

  supplier_company_name: { type: String, required: false, default: "ไม่มี" }, //ชื่อบริษัท
  supplier_company_number: { type: String, required: false, default: "ไม่มี" }, //เลขที่บริษัท
  supplier_company_address: { type: String, required: false, default: "ไม่มี" }, //ที่อยู่บริษัท
  supplier_type: { type: String, required: false }, //ประเภท
  remark: [
    {
      text: { type: String, required: false },
      createdAt: { type: Date, required: false, default: Date.now() },
    },
  ],
});

const Suppliers = mongoose.model("supplier", SupplierSchema);

module.exports = { Suppliers };
