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
  profile_image: { type: String, required: false },
  customer_taxnumber: { type: String, required: false }, //เลขปรพจำตัวผู้เสียภาษี
  customer_number: { type: String, required: false },
  customer_username: { type: String, required: false }, // ไอดีสมาชิก
  customer_password: { type: String, required: false }, //รหัสผ่าน
  // customer_id: { type: String, required: false }, //รหัสสมาชิก
  profile_image: { type: String, required: false },
  customer_prefix: { type: String, required: false }, //คำนำหน้า
  customer_name: { type: String, required: false },
  customer_lastname: { type: String, required: false },
  customer_idcard: { type: String, required: false }, //รหัสบัตรประชาชน
  customer_birthday: { type: String, required: false }, //วันเกิด
  customer_email: { type: String, required: false },
  customer_phone: { type: String, required: false },
  customer_position: { type: String, required: false },
  customer_role: { type: String, required: false },
  customer_contact: {
    type: String,
    required: false,
    default: "เพิ่มข้อมูลติดต่อลูกค้า",
  }, //ที่ติดต่อลูกค้า
  customer_contact_number: { type: String, required: false }, //เบอร์โทรติดต่อผู้ประสานงาน
  status: { type: Array, required: false },
  customer_note: { type: String, default: "ไม่มี" }, //หมายเหตุ
  customer_type: { type: String, required: false, default: "ไม่มี" }, //รายปี  (รายเดือน ทำเสร็จจ่าย / จ่ายล่วงหน้า 3เดือน /6 เดือน)
});
CustomerSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { _id: this._id, name: this.customer_name, row: "customer" },
    process.env.JWTPRIVATEKEY,
    {
      expiresIn: "90d",
    }
  );
  return token;
};
const Customer = mongoose.model("customer", CustomerSchema);
module.exports = { Customer };
