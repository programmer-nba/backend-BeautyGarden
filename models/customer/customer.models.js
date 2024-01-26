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
const CustomerSchema = new mongoose.Schema({
  customer_taxnumber: { type: String, required: false }, //เลขปรพจำตัวผู้เสียภาษี
  customer_number: { type: String, required: false },
  customer_username: { type: String, required: false }, // ไอดีสมาชิก
  customer_password: { type: String, required: false }, //รหัสผ่าน
  // customer_id: { type: String, required: false }, //รหัสสมาชิก
  profile_image: { type: String, required: false },
  customer_prefix: { type: String, required: false }, //คำนำหน้า
  customer_name: { type: String, required: false },
  customer_lastname: { type: String, required: true },
  customer_idcard: { type: Number, required: true }, //รหัสบัตรประชาชน
  customer_birthday: { type: String, required: true }, //วันเกิด
  customer_email: { type: String, required: false },
  customer_phone: { type: String, required: true },
  customer_position: { type: String, required: true },
  customer_role: { type: String, required: false },
  customer_contact: {
    type: String,
    required: false,
    default: "เพิ่มข้อมูลติดต่อลูกค้า",
  }, //ที่ติดต่อลูกค้า
  customer_note: { type: String, default: "ไม่มี" }, //หมายเหตุ
  customer_type: { type: String, required: false, default: "ไม่มี" }, //รายปี  (รายเดือน ทำเสร็จจ่าย / จ่ายล่วงหน้า 3เดือน /6 เดือน)
});
CustomerSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { _id: this._id, name: this.customer_name, row: "customer" },
    process.env.JWTPRIVATEKEY,
    {
      expiresIn: "4h",
    }
  );
  return token;
};
const Customer = mongoose.model("customer", CustomerSchema);

const validateCustomer = (data) => {
  const schema = Joi.object({
    customer_taxnumber: Joi.string()
      .required()
      .label("กนุณากรอกเลขประจำตัวผู้เสียภาษี"),
    customer_username: Joi.string().required().label("กรุณากรอกไอดี"),
    customer_password: Joi.string().required().label("กรุณากรอกพาสเวิร์ด"),
    customer_name: Joi.string().required().label("กรุณากรอกชื่อ"),
    customer_lastname: Joi.string().required().label("กรุณากรอกนามสกุล"),
    customer_phone: Joi.string().required().label("กรอกเบอร์โทรลูกค้า"),
    customer_position: Joi.string().required().label("กรอกตำแหน่งที่อยู่"),
    customer_idcard: Joi.string().required().label("กรอกเลขบัตรประชาชน"),
    customer_birthday: Joi.string().required().label("กรอกวันเดือนปีเกิด"),
    customer_email: Joi.string().required().label("กรอกอีเมล์"),
    customer_type: Joi.string().required().label("กรอกสถานะประเภทลูกค้า"),
    customer_contact: Joi.string().required().label("กรอกข้อมูลติดต่อลูกค้า"),
  });
  if ("member_note" in data) {
    delete data.member_note;
  }
  return schema.validate(data);
};
module.exports = { Customer, validateCustomer };
