const mongoose = require("mongoose");
const Joi = require("joi");

const imgSchema = new mongoose.Schema({
  profile_image: { type: String, required: false }, //รูปภาพบริษํท
});

const Imgs = mongoose.model("img", imgSchema);

module.exports = { Imgs };
