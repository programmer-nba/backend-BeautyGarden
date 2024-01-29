const bcrypt = require("bcrypt");
const dayjs = require("dayjs");
const Joi = require("joi");
const fs = require("fs");
const { google } = require("googleapis");
const { default: axios } = require("axios");
const req = require("express/lib/request.js");
const { Admins, validateAdmin } = require("../../models/admin/admin.models");
const { Signature } = require("../../models/signature/signature.models");
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
        // const productpack = await PackProducts.findOne({product_id:req.body.product_id})//เพิ่มตรงส่วนนี้มา
        for (var i = 0; i < req.files.length; i++) {
          await uploadFileCreate(req.files, res, { i, reqFiles });
        }
        const data = {
          name: req.body.name,
          image_signature: reqFiles[0],
          position: req.body.position,
          status: true,
        };
        const new_product = await Signature.create(data);
        if (new_product) {
          return res
            .status(200)
            .send({ status: true, message: "บันทึกสำเร็จ", data: new_product });
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
exports.EditSugnature = async (req, res) => {
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
        const signature = await Signature.findByIdAndUpdate(id, {
          ...req.body,
          image_signature: reqFiles[0],
        });
        if (signature) {
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
exports.getSugnatureAlls = async (req, res) => {
  try {
    const sugnature = await Signature.find();
    if (!sugnature) {
      return res
        .status(404)
        .send({ status: false, message: "ไม่พบข้อมูลรายเซ็น" });
    } else {
      return res
        .status(200)
        .send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: sugnature });
    }
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, message: "มีบางอย่างผิดพลาด" });
  }
};
exports.getSugnatureById = async (req, res) => {
  try {
    const id = req.params.id;
    const sugnature = await Signature.findById(id);
    if (!sugnature) {
      return res
        .status(404)
        .send({ status: false, message: "ไม่พบข้อมูลลายเซ็น" });
    } else {
      return res
        .status(200)
        .send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: sugnature });
    }
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, message: "มีบางอย่างผิดพลาด" });
  }
};
exports.deleteSugnature = async (req, res) => {
  try {
    const id = req.params.id;
    const sugnature = await Signature.findByIdAndDelete(id);
    if (!sugnature) {
      return res
        .status(404)
        .send({ status: false, message: "ไม่พบข้อมูลลายเซ็น" });
    } else {
      return res.status(200).send({ status: true, message: "ลบข้อมูลสำเร็จ" });
    }
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, message: "มีบางอย่างผิดพลาด" });
  }
};
exports.deleteAllSugnature = async (req, res) => {
  try {
    const result = await Signature.deleteMany({});

    if (result.deletedCount > 0) {
      return res
        .status(200)
        .send({ status: true, message: "ลบข้อมูลสำเร็จ" });
    } else {
      return res
        .status(404)
        .send({ status: false, message: "ไม่พบข้อมูลลายเซ็น" });
    }
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, message: "มีบางอย่างผิดพลาด" });
  }
};
