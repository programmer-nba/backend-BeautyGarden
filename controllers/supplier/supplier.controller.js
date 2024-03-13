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
exports.deleteSuppliers = async (req, res) => {
  try {
    const id = req.params.id;
    const supplier = await Suppliers.findByIdAndDelete(id);
    if (!supplier) {
      return res
        .status(404)
        .send({ status: false, message: "ไม่พบข้อมูลซัพพายเออร์ในระบบ" });
    } else {
      return res
        .status(200)
        .send({ status: true, message: "ลบข้อซัพพายเออร์สำเร็จ" });
    }
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, message: "มีบางอย่างผิดพลาด" });
  }
};
exports.deleteAllSupplier = async (req, res) => {
  try {
    const result = await Suppliers.deleteMany({});

    if (result.deletedCount > 0) {
      return res
        .status(200)
        .send({ status: true, message: "ลบข้อมุลซัพพายเออร์ทั้งหมดสำเร็จ" });
    } else {
      return res.status(404).send({
        status: false,
        message: "ไม่พบใบข้อมุลซัพพายเออร์ที่ต้องการลบ",
      });
    }
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, message: "มีบางอย่างผิดพลาด" });
  }
};
exports.updateSupplier = async (req, res) => {
  try {
    const id = req.params.id;
    if (!req.body) {
      return res
        .status(400)
        .send({ status: false, message: error.details[0].message });
    }
    const new_supplier = await Suppliers.findByIdAndUpdate(id, {
      ...req.body,
    });
    if (new_supplier) {
      return res.send({
        status: true,
        message: "แก้ไขข้อมูลซัพพายเออร์เรียบร้อย",
      });
    } else {
      return res.status(400).send({
        status: false,
        message: "ไม่สามารถแก้ไขซัพพายเออร์นี้ได้",
      });
    }
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, message: "มีบางอย่างผิดพลาด" });
  }
};
exports.updateImgIdens = async (req, res) => {
  try {
    let upload = multer({ storage: storage }).array("imgCollection", 20);
    upload(req, res, async function (err) {
      if (err) {
        return res
          .status(403)
          .send({ message: "มีบางอย่างผิดพลาด", data: err });
      }
      const reqFiles = [];
      if (!req.files) {
        res.status(500).send({
          message: "มีบางอย่างผิดพลาด",
          data: "No Request Files",
          status: false,
        });
      } else {
        const url = req.protocol + "://" + req.get("host");
        for (var i = 0; i < req.files.length; i++) {
          await uploadFileCreate(req.files, res, { i, reqFiles });
        }
        const id = req.params.id;
        const { supplier_iden_number } = req.body;
        const new_supplier = await Suppliers.findByIdAndUpdate(id, {
          supplier_iden: reqFiles[0],
          supplier_iden_number: supplier_iden_number,
        });
        if (new_supplier) {
          return res.status(200).send({
            status: true,
            message: "บันทึกสำเร็จ",
          });
        } else {
          return res
            .status(403)
            .send({ status: false, message: "ไม่สามารถบันทึกได้" });
        }
      }
    });
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, message: "มีบางอย่างผิดพลาด" });
  }
};
exports.updateImgBank = async (req, res) => {
  try {
    let upload = multer({ storage: storage }).array("imgCollection", 20);
    upload(req, res, async function (err) {
      if (err) {
        return res
          .status(403)
          .send({ message: "มีบางอย่างผิดพลาด", data: err });
      }
      const reqFiles = [];
      if (!req.files) {
        res.status(500).send({
          message: "มีบางอย่างผิดพลาด",
          data: "No Request Files",
          status: false,
        });
      } else {
        const url = req.protocol + "://" + req.get("host");
        for (var i = 0; i < req.files.length; i++) {
          await uploadFileCreate(req.files, res, { i, reqFiles });
        }
        const id = req.params.id;
        const { supplier_bookbank_name, supplier_bookbank_number } = req.body;
        const new_supplier = await Suppliers.findByIdAndUpdate(id, {
          supplier_bookbank: reqFiles[0],
          supplier_bookbank_name: supplier_bookbank_name,
          supplier_bookbank_number: supplier_bookbank_number,
        });
        if (new_supplier) {
          return res.status(200).send({
            status: true,
            message: "บันทึกสำเร็จ",
          });
        } else {
          return res
            .status(403)
            .send({ status: false, message: "ไม่สามารถบันทึกได้" });
        }
      }
    });
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, message: "มีบางอย่างผิดพลาด" });
  }
};

