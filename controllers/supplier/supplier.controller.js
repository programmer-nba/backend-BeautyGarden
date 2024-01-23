const bcrypt = require("bcrypt");
const dayjs = require("dayjs");
const Joi = require("joi");
const fs = require("fs");
const { google } = require("googleapis");
const { default: axios } = require("axios");
const req = require("express/lib/request.js");
const { Admins, validateAdmin } = require("../../models/admin/admin.models");
const { Branch } = require("../../models/ฺฺbranch/ฺฺbranch.models");
const { Suppliers } = require("../../models/supplier/supplier.model");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
    // console.log(file.originalname);
  },
});
const {
  uploadFileCreate,
  deleteFile,
} = require("../../funtions/uploadfilecreate");

exports.create = async (req, res) => {
  try {
    const supplier = await Suppliers.findOne({
      supplier_company_name: req.body.supplier_company_name,
    });
    if (supplier)
      return res.status(409).send({
        status: false,
        message: "มีชื่อซัพพายเออร์นี้ในระบบแล้ว",
      });
    await new Suppliers({
      ...req.body,
    }).save();
    res
      .status(201)
      .send({ message: "เพิ่มข้อมูลซัพพายเออร์สำเร็จ", status: true });
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, message: "มีบางอย่างผิดพลาด" });
  }
};
exports.getSupplierAll = async (req, res) => {
  try {
    const supplier = await Suppliers.find();
    if (!supplier) {
      return res
        .status(404)
        .send({ status: false, message: "ไม่พบซัพพายเออร์ในระบบ" });
    } else {
      return res
        .status(200)
        .send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: supplier });
    }
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, message: "มีบางอย่างผิดพลาด" });
  }
};
exports.getSupplierById = async (req, res) => {
  try {
    const id = req.params.id;
    const supplier = await Suppliers.findById(id);
    if (!supplier) {
      return res
        .status(404)
        .send({ status: false, message: "ไม่พบซัพพายเออร์ในระบบ" });
    } else {
      return res
        .status(200)
        .send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: supplier });
    }
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, message: "มีบางอย่างผิดพลาด" });
  }
};
