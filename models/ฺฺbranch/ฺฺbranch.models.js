const mongoose = require("mongoose");
const Joi = require("joi");

const BranchSchema = new mongoose.Schema({
  Branch_tel: { type: String, required: false }, //เบอร์โทรศัพท์
  Branch_status: { type: Boolean, required: false, default: true }, //สถานะ

  //บัญชีธนาคาร
  Branch_bookbank: { type: String, required: false, default: "-" }, // images
  Branch_bookbank_name: { type: String, required: false, default: "-" }, //ธนาคาร
  Branch_bookbank_number: { type: String, required: false, default: "-" }, //เลขที่บัญชี

  //เลขที่การเสียภาษี

  //บัตรประชาชน
  Branch_iden: { type: String, required: false, default: "-" }, // images
  Branch_iden_number: { type: String, required: false, default: "-" }, //เลขประจำตัวประชาชน

  Branch_company_name: { type: String, required: false, default: "ไม่มี" }, //ชื่อบริษัท
  Branch_company_number: { type: String, required: false, default: "ไม่มี" }, //เลขที่บริษัท
  Branch_company_address: { type: String, required: false, default: "ไม่มี" }, //ที่อยู่บริษัท
});

const Branch = mongoose.model("Branch", BranchSchema);

module.exports = { Branch };
