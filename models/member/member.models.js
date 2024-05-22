const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");
const complexityOptions = {
  min: 6,
  max: 30,
  lowerCase: 0,
  upperCase: 0,
  numeric: 0,
  symbol: 0,
  requirementCount: 2,
};
const MemberSchema = new mongoose.Schema({
  member_taxnumber: { type: String, required: false }, //เลขปรพจำตัวผู้เสียภาษี
  member_number: { type: String, required: false },
  profile_image: { type: String, required: false },
  member_username: { type: String, required: true }, // ไอดีสมาชิก
  member_password: { type: String, required: true }, //รหัสผ่าน
  member_id: { type: String, required: false }, //รหัสสมาชิก
  member_prefix: { type: String, required: false }, //คำนำหน้า
  member_name: { type: String, required: false },
  member_lastname: { type: String, required: false },
  member_idcard: { type: Number, required: false }, //รหัสบัตรประชาชน
  member_birthday: { type: String, required: false }, //วันเกิด
  member_taxnumber: { type: String, required: false }, //เลขที่ภาษี
  member_email: { type: String, required: false },
  member_expirationdate: { type: String, required: false, default: "-" }, //วันหมดอายุ
  member_phone: { type: String, required: false },
  member_position: { type: String, required: false },
  member_role: { type: String, required: false },
  member_note: { type: String, default: "ไม่มี" }, //หมายเหตุ
  member_type: { type: String, required: false, default: "ไม่มี" }, //รายปี  (รายเดือน ทำเสร็จจ่าย / จ่ายล่วงหน้า 3เดือน /6 เดือน)
});
MemberSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { _id: this._id, name: this.member_name, row: "member" },
    process.env.JWTPRIVATEKEY,
    {
      expiresIn: "90d",
    }
  );
  return token;
};
const Member = mongoose.model("member", MemberSchema);

const validatemember = (data) => {
  const schema = Joi.object({
    member_taxnumber: Joi.string()
      .required()
      .label("กนุณากรอกเลขประจำตัวผู้เสียภาษี"),
    member_username: Joi.string().required().label("กรุณากรอกไอดี"),
    member_password: Joi.string().required().label("กรุณากรอกพาสเวิร์ด"),
    member_name: Joi.string().required().label("กรุณากรอกชื่อ"),
    member_lastname: Joi.string().required().label("กรุณากรอกนามสกุล"),
    member_phone: Joi.string().required().label("กรอกเบอร์โทรสมาชิก"),
    member_position: Joi.string().required().label("กรอกตำแหน่งที่อยู่"),
    member_idcard: Joi.string().required().label("กรอกเลขบัตรประชาชน"),
    member_birthday: Joi.string().required().label("กรอกวันเดือนปีเกิด"),
    member_email: Joi.string().required().label("กรอกอีเมล์"),
    member_type: Joi.string().required().label("กรอกสถานะประเภทสมาชิก"),
  });
  if ("member_note" in data) {
    delete data.member_note;
  }
  return schema.validate(data);
};
module.exports = { Member, validatemember };
