const bcrypt = require("bcrypt");
const dayjs = require("dayjs");
const Joi = require("joi");
const fs = require("fs");
const { google } = require("googleapis");
const { default: axios } = require("axios");
const req = require("express/lib/request.js");
const { CostType } = require("../../models/costtype/cost_type.models");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const {
  uploadFileCreate,
  deleteFile,
} = require("../../funtions/uploadfilecreate");

exports.create = async (req, res) => {
  try {
    const supplier = await CostType.findOne({
      cost_name: req.body.cost_name,
    });
    if (supplier)
      return res.status(409).send({
        status: false,
        message: "มีประเภทนี้อยู่ในระบบอยู่เเล้ว",
      });
    await new CostType({
      ...req.body,
    }).save();
    res.status(201).send({ message: "เพิ่มข้อมูลประเภทสำเร็จ", status: true });
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, message: "มีบางอย่างผิดพลาด" });
  }
};
exports.getCostTypeById = async (req, res) => {
  try {
    const id = req.params.id;
    const type = await CostType.findById(id);
    if (!type) {
      return res
        .status(404)
        .send({ status: false, message: "ไม่พบประเภทค่าใช้จ่าย" });
    } else {
      return res
        .status(200)
        .send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: type });
    }
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, message: "มีบางอย่างผิดพลาด" });
  }
};
exports.getCostTypeAll = async (req, res) => {
  try {
    const type = await CostType.find();
    if (!type) {
      return res
        .status(404)
        .send({ status: false, message: "ไม่พบข้อมูลประเภทค่าใช้จ่าย" });
    } else {
      return res
        .status(200)
        .send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: type });
    }
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, message: "มีบางอย่างผิดพลาด" });
  }
};
exports.deleteCostType = async (req, res) => {
  try {
    const id = req.params.id;
    const type = await CostType.findByIdAndDelete(id);
    if (!type) {
      return res
        .status(404)
        .send({ status: false, message: "ไม่พบข้อมูลประเภทค่าใช้จ่าย" });
    } else {
      return res
        .status(200)
        .send({ status: true, message: "ลบประเภทค่าใช้จ่ายสำเร็จ" });
    }
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, message: "มีบางอย่างผิดพลาด" });
  }
};
exports.deleteAllCostTyper = async (req, res) => {
  try {
    const result = await CostType.deleteMany({});

    if (result.deletedCount > 0) {
      return res.status(200).send({
        status: true,
        message: "ลบข้อมูลปะเภทค่าใช้จ่ายทั้งหมดสำเร็จ",
      });
    } else {
      return res.status(404).send({
        status: false,
        message: "ไม่พบข้อมูลประเภทค่าใช้จ่ายที่ต้องการลบ",
      });
    }
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, message: "มีบางอย่างผิดพลาด" });
  }
};
exports.updateCostType = async (req, res) => {
  try {
    const id = req.params.id;
    if (!req.body) {
      return res
        .status(400)
        .send({ status: false, message: error.details[0].message });
    }
    const new_type = await CostType.findByIdAndUpdate(id, {
      ...req.body,
    });
    if (new_type) {
      return res.send({
        status: true,
        message: "เเก้ไขข้อมูลประเภทค่าใช้จ่ายสำเร็จ",
      });
    } else {
      return res.status(400).send({
        status: false,
        message: "ไม่สามารถเเก้ไขประเภทค่าใช้จ่ายได้",
      });
    }
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, message: "มีบางอย่างผิดพลาด" });
  }
};
