const mongoose = require("mongoose");
const Joi = require("joi");

const BranchSchema = new mongoose.Schema({
  Branch_address: { type: String, required: false }, //ที่อยู่
  Branch_subdistrict: { type: String, required: false }, //ที่อยู่ เเขวน ตำบล
  Branch_district: { type: String, required: false }, //เขต
  Branch_province: { type: String, required: false }, //จังหวัด
  Branch_postcode: { type: String, required: false }, //รหัสไปรษณีย์
  Branch_tel: { type: String, required: false }, //เบอร์โทรศัพท์
  Branch_status: { type: Boolean, required: false, default: true }, //สถานะ
  bank: {//บัญชีธนาคาร
    name: { type: String, required: false, default: "-" },
    number: { type: String, required: false, default: "-" },
    image: { type: String, required: false, default: "-" },
    status: { type: Boolean, required: false, default: false },
    remark: { type: String, required: false, default: "-" }, //อยู่ระหว่างการตรวจสอบ , ไม่ผ่านการตรวจสอบ ,ตรวจสอบสำเร็จ
  },
  //เลขที่การเสียภาษี
  taxnumber: { type: Number, required: false, default: true },//เลขที่การเสียภาษี
  //บัตรประชาชน
  Branch_iden: { type: String, required: false, default: "-" }, // images
  Branch_iden_number: { type: String, required: false, default: "-" }, //เลขประจำตัวประชาชน

  Branch_company_name: { type: String, required: false, default: "ไม่มี" }, //ชื่อบริษัท
  Branch_company_number: { type: String, required: false, default: "ไม่มี" }, //เลขที่บริษัท
  Branch_company_address: { type: String, required: false, default: "ไม่มี" }, //ที่อยู่บริษัท
});

const Branch = mongoose.model("Branch", BranchSchema);

module.exports = { Branch };
