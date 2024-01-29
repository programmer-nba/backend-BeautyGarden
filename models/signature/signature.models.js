const mongoose = require("mongoose");
const Joi = require("joi");

const SignatureSchema = new mongoose.Schema({
  name: { type: String, required: false, default: "-" }, //ชื่อเจ้าของลายเซ็น
  image_signature: { type: String, required: false, default: "-" }, //รูปภาพลายเซ็น
  position: { type: String, required: false, default: "-" }, //ตำเเหน่งเจ้าของลายเซ็น
  status: { type: Boolean, required: false, default: false },
});

const Signature = mongoose.model("signature", SignatureSchema);

module.exports = { Signature };
