const mongoose = require("mongoose");
const Joi = require("joi");

const CostTypeSchema = new mongoose.Schema({
  cost_name: {type: String, required: false}, //ชื่อค่าใช้จ่าย
});

const CostType = mongoose.model("CostType", CostTypeSchema);

module.exports = {CostType};
