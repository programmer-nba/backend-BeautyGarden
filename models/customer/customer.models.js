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
  profile_image: { type: String },
  customer_taxnumber: { type: String, default: null }, //เลขปรพจำตัวผู้เสียภาษี
  customer_number: { type: String, default: "" },
  customer_username: { type: String, default: "" }, // ไอดีสมาชิก
  customer_password: { type: String, default: "" }, //รหัสผ่าน
  // customer_id: { type: String, required: false }, //รหัสสมาชิก
  profile_image: { type: String, default: "" },
  customer_prefix: { type: String, default: "" }, //คำนำหน้า
  customer_name: { type: String, required: false },
  customer_lastname: { type: String, default: "" },
  customer_idcard: { type: String, default: "" }, //รหัสบัตรประชาชน
  customer_birthday: { type: String, default: "" }, //วันเกิด
  customer_email: { type: String, default: "" },
  customer_phone: { type: String, default: "" },
  customer_position: { type: String, default: "" },
  customer_role: { type: String, default: "" },
  customer_map: { type: String, default: "" },
  customer_contact: { type: String, default: "" },
  customer_contact_number: { type: String, default: "" }, //เบอร์โทรติดต่อผู้ประสานงาน
  customer_contact_sign: { type: String, default: "" },
  status: { type: Array, required: false, default: [] },
  customer_note: { type: String, default: "" },
  customer_type: { type: String, required: false, default: "Normal" }, //รายปี  (รายเดือน ทำเสร็จจ่าย / จ่ายล่วงหน้า 3เดือน /6 เดือน)
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
