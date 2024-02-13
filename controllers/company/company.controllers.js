const bcrypt = require("bcrypt");
const dayjs = require("dayjs");
const Joi = require("joi");
const fs = require("fs");
const { google } = require("googleapis");
const { default: axios } = require("axios");
const req = require("express/lib/request.js");
const { Admins, validateAdmin } = require("../../models/admin/admin.models");
const { Imgs } = require("../../models/img/img.models");
const { Company } = require("../../models/company/company.models");
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
    const company = await Company.findOne({
      Branch_company_name: req.body.Branch_company_name,
    });
    if (company)
      return res.status(409).send({
        status: false,
        message: "มีชื่อบริษัทนี้อยู่ในระบบเเล้ว",
      });
    await new Company({
      ...req.body,
    }).save();
    res.status(201).send({ message: "เพิ่มข้อมูลบริษัทสำเร็จ", status: true });
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, message: "มีบางอย่างผิดพลาด" });
  }
};
exports.ImportBankCompany = async (req, res) => {
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
        const company = await Company.findByIdAndUpdate(id, {
          ...req.body,
          "bank.name": req.body.name,
          "bank.name_bank": req.body.name_bank,
          "bank.number": req.body.number,
          "bank.image": reqFiles[0],
        });
        if (company) {
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
exports.ImportlogoCompany = async (req, res) => {
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
        const member = await Company.findByIdAndUpdate(id, {
          ...req.body,
          profile_image: reqFiles[0],
        });
        if (member) {
          return res.status(200).send({
            message: "เพิ่มรูปภาพสำเร็จ",
            status: true,
          });
        } else {
          console.error(err); // Log ข้อผิดพลาดที่เกี่ยวข้องกับการอัปเดตข้อมูล
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
exports.EditCompany = async (req, res) => {
  try {
    const id = req.params.id;
    if (!req.body) {
      return res
        .status(400)
        .send({ status: false, message: error.details[0].message });
    }
    const new_supplier = await Company.findByIdAndUpdate(id, {
      ...req.body,
    });
    if (new_supplier) {
      return res.send({
        status: true,
        message: "เเก้ไขข้อมูลบริษัทสำเร็จ",
      });
    } else {
      return res.status(400).send({
        status: false,
        message: "เเก้ไขข้อมูลบริษัทไม่สำเร็จ",
      });
    }
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, message: "มีบางอย่างผิดพลาด" });
  }
};
exports.deleteCompany = async (req, res) => {
  try {
    const id = req.params.id;
    const company = await Company.findByIdAndDelete(id);
    if (!company) {
      return res
        .status(404)
        .send({ status: false, message: "ไม่พบบริษัทในระบบ" });
    } else {
      return res.status(200).send({ status: true, message: "ลบข้อมูลสำเร็จ" });
    }
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, message: "มีบางอย่างผิดพลาด" });
  }
};
exports.deleteAllCompany = async (req, res) => {
  try {
    const result = await Company.deleteMany({});

    if (result.deletedCount > 0) {
      return res
        .status(200)
        .send({ status: true, message: "ลบข้อมูลบริษัททั้งหมดสำเร็จ" });
    } else {
      return res
        .status(404)
        .send({ status: false, message: "ไม่พบข้อมุลสาขา" });
    }
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, message: "มีบางอย่างผิดพลาด" });
  }
};
exports.getCompannyAlls = async (req, res) => {
  try {
    const companny = await Company.find();
    if (!companny) {
      return res
        .status(404)
        .send({ status: false, message: "ไม่พบข้อมูลบริษัทในระบบ" });
    } else {
      return res
        .status(200)
        .send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: companny });
    }
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, message: "มีบางอย่างผิดพลาด" });
  }
};
exports.getCompanyById = async (req, res) => {
  try {
    const id = req.params.id;
    const companny = await Company.findById(id);
    if (!companny) {
      return res
        .status(404)
        .send({ status: false, message: "ไม่พบข้อมูลบริษัทในระบบ" });
    } else {
      return res
        .status(200)
        .send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: companny });
    }
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, message: "มีบางอย่างผิดพลาด" });
  }
};
exports.InsertImg = async (req, res) => {
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
      const newImg = new Imgs({ profile_image: reqFiles[0] });
      const savedImg = await newImg.save();

      if (savedImg) {
        return res.status(200).send({
          message: "เพิ่มรูปภาพสำเร็จ",
          status: true,
          data: savedImg,
        });
      } else {
        return res.status(500).send({
          message: "ไม่สามารถเพิ่มรูปภาพได้",
          status: false,
        });
      }
    });
  } catch (error) {
    return res.status(500).send({ status: false, error: error.message });
  }
};
exports.getImgAll = async (req, res) => {
  try {
    const img = await Imgs.find();
    if (!img) {
      return res.status(404).send({ status: false, message: "ไม่พบรูกภาพ" });
    } else {
      return res
        .status(200)
        .send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: img });
    }
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, message: "มีบางอย่างผิดพลาด" });
  }
};
exports.deleteImgByID = async (req, res) => {
  try {
    const id = req.params.id;
    const company = await Imgs.findByIdAndDelete(id);
    if (!company) {
      return res
        .status(404)
        .send({ status: false, message: "ไม่พบบริษัทในระบบ" });
    } else {
      return res.status(200).send({ status: true, message: "ลบข้อมูลสำเร็จ" });
    }
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, message: "มีบางอย่างผิดพลาด" });
  }
};
