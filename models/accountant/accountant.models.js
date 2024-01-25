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

const AccountantSchema = new mongoose.Schema({
  accountant_number: { type: String, required: false }, //หรัสประจำตัว
  profile_image: { type: String, required: false }, //รูปภาพ
  card_number: { type: Number, required: true }, //บัตรประชาชน
  accountant_name: { type: String, required: true }, //ชื่อ
  accountant_tel: { type: String, required: true }, //เบอร์โทร
  accountant_username: { type: String, required: true }, //เลขบัตร
  accountant_password: { type: String, required: true }, //รหัส
  accountant_position: { type: String, required: true },
});

AccountantSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { _id: this._id, name: this.accountant_name, row: "accountant" },
    process.env.JWTPRIVATEKEY,
    {
      expiresIn: "4h",
    }
  );
  return token;
};

const Accountant = mongoose.model("Accountant", AccountantSchema);

const validateAccountant = (data) => {
  const schema = Joi.object({
    accountant_name: Joi.string().required().label("กรุณากรอกชื่อผู้ใช้ด้วย"),
    accountant_username: Joi.string().required().label("กรุณากรอก ไอดี ผู้ใช้ด้วย"),
    card_number: Joi.string().required().label("กรุณากรอกเลขบัตรผู้ใช้ด้วย"),
    accountant_tel: Joi.string().required().label("กรุณากรอกเบอร์โทรผู้ใช้ด้วย"),
    accountant_password: passwordComplexity(complexityOptions)
      .required()
      .label("admin_password"),
      accountant_position: Joi.string().required().label("กรุณากรอกเลเวลผู้ใช้ด้วย"),
  });
  return schema.validate(data);
};

module.exports = { Accountant, validateAccountant };
