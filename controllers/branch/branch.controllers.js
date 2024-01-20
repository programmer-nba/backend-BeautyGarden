const bcrypt = require("bcrypt");
const dayjs = require("dayjs");
const Joi = require("joi");
const fs = require("fs");
const { google } = require("googleapis");
const { default: axios } = require("axios");
const req = require("express/lib/request.js");
const { Admins, validateAdmin } = require("../../models/admin/admin.models");
const { Branch } = require("../../models/ฺฺbranch/ฺฺbranch.models");
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
    const branch = await Branch.findOne({
      Branch_company_name: req.body.Branch_company_name,
    });
    if (branch)
      return res.status(409).send({
        status: false,
        message: "มีชื่อสาขานี้ในระบบแล้ว",
      });
    await new Branch({
      ...req.body,
    }).save();
    res.status(201).send({ message: "เพิ่มข้อมูลสาขาสำเร็จ", status: true });
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, message: "มีบางอย่างผิดพลาด" });
  }
};
exports.ImportBank = async (req, res) => {
  try {
    let upload = multer({ storage: storage }).array("imgCollection", 20);
    upload(req, res, async function (err) {
      const reqFiles = [];
      const result = [];
      if (err) {
        return res.status(500).send(err);
      }
      if (req.files) {
        const url = req.protocol + "://" + req.get("host");
        for (var i = 0; i < req.files.length; i++) {
          const src = await uploadFileCreate(req.files, res, { i, reqFiles });
          result.push(src);
        }
      }
      const id = req.params.id;
      if (id && !req.body.password) {
        const branch = await Branch.findByIdAndUpdate(id, {
          ...req.body,
          "bank.name": req.body.name,
          "bank.number": req.body.number,
          "bank.image": reqFiles[0],
        });
        if (branch) {
          return res.status(200).send({
            message: "เพิ่มรูปภาพสำเร็จ",
            status: true,
          });
        } else {
          return res.status(500).send({
            message: "ไม่สามารถเพิ่มรูปภาพได้",
            status: false,
          });
        }
      }
    });
  } catch (error) {
    return res.status(500).send({ status: false, error: error.message });
  }
};
exports.EditBranch = async (req, res) => {
  try {
    const id = req.params.id;
    if (!req.body) {
      return res
        .status(400)
        .send({ status: false, message: error.details[0].message });
    }
    const new_supplier = await Branch.findByIdAndUpdate(id, {
      ...req.body,
    });
    if (new_supplier) {
      return res.send({
        status: true,
        message: "เเก้ไขข้อมูลสาขาสำเร็จ",
      });
    } else {
      return res.status(400).send({
        status: false,
        message: "เเก้ไขข้อมูลสาขาไม่สำเร็จ",
      });
    }
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, message: "มีบางอย่างผิดพลาด" });
  }
};
exports.getBranchAll = async (req, res) => {
  try {
    const branch = await Branch.find();
    if (!branch) {
      return res
        .status(404)
        .send({ status: false, message: "ไม่พบข้อมูลสาขาในระบบ" });
    } else {
      return res
        .status(200)
        .send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: branch });
    }
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, message: "มีบางอย่างผิดพลาด" });
  }
};

exports.getBranchById = async (req, res) => {
  try {
    const id = req.params.id;
    const branch = await Branch.findById(id);
    if (!branch) {
      return res
        .status(404)
        .send({ status: false, message: "ไม่พบสาขาในระบบ" });
    } else {
      return res
        .status(200)
        .send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: branch });
    }
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, message: "มีบางอย่างผิดพลาด" });
  }
};
exports.deleteBranch = async (req, res) => {
  try {
    const id = req.params.id;
    const branch = await Branch.findByIdAndDelete(id);
    if (!branch) {
      return res
        .status(404)
        .send({ status: false, message: "ไม่พบสาขาในระบบ" });
    } else {
      return res
        .status(200)
        .send({ status: true, message: "ลบข้อมูลสำเร็จ" });
    }
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, message: "มีบางอย่างผิดพลาด" });
  }
};
