const bcrypt = require("bcrypt");
const dayjs = require("dayjs");
const Joi = require("joi");
const { google } = require("googleapis");
const { default: axios } = require("axios");
const req = require("express/lib/request.js");
const { Admins, validateAdmin } = require("../../models/admin/admin.models");
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
const { admin } = require("googleapis/build/src/apis/admin");

exports.create = async (req, res) => {
  try {
    let upload = multer({ storage: storage }).array("imgCollection", 20);
    upload(req, res, async function (err) {
      const reqFiles = [];
      const result = [];
      if (err) {
        return res.status(500).send(err);
      }
      let profile_image = ""; // ตั้งตัวแปรรูป
      if (req.files) {
        const url = req.protocol + "://" + req.get("host");
        for (var i = 0; i < req.files.length; i++) {
          const src = await uploadFileCreate(req.files, res, { i, reqFiles });
          result.push(src);
          //   reqFiles.push(url + "/public/" + req.files[i].filename);
        }
        profile_image = reqFiles[0];
      }
      const { error } = validateAdmin(req.body);
      if (error)
        return res
          .status(400)
          .send({ message: error.details[0].message, status: false });

      const user = await Admins.findOne({
        admin_username: req.body.admin_username,
      });
      if (user) {
        return res
          .status(409)
          .send({ status: false, message: "username นี้มีคนใช้แล้ว" });
      }
      const adminNumber = await adminnumber();
      const salt = await bcrypt.genSalt(Number(process.env.SALT));
      const hashPassword = await bcrypt.hash(req.body.admin_password, salt);
      const admin = new Admins({
        adminnumber: adminNumber,
        profile_image: profile_image,
        admin_username: req.body.admin_username,
        card_number: req.body.card_number,
        admin_name: req.body.admin_name,
        admin_tel: req.body.admin_tel,
        admin_password: hashPassword,
        admin_position: req.body.admin_position,
      });
      const add = await admin.save();
      return res.status(200).send({
        status: true,
        message: "คุณได้สร้างไอดี user เรียบร้อย",
        data: add,
      });
    });
  } catch (error) {
    return res.status(500).send({ status: false, error: error.message });
  }
};
exports.EditAdmin = async (req, res) => {
  try {
    let upload = multer({ storage: storage }).array("imgCollection", 20);
    upload(req, res, async function (err) {
      const reqFiles = [];
      const result = [];
      if (err) {
        return res.status(500).send(err);
      }
      let profile_image = ""; // ตั้งตัวแปรรูป
      if (req.files) {
        const url = req.protocol + "://" + req.get("host");
        for (var i = 0; i < req.files.length; i++) {
          const src = await uploadFileCreate(req.files, res, { i, reqFiles });
          result.push(src);
        }
        profile_image = reqFiles[0];
      }
      const user = await Admins.findOne({
        admin_username: req.body.admin_username,
      });
      if (user) {
        return res
          .status(409)
          .send({ status: false, message: "username นี้มีคนใช้แล้ว" });
      }
      const id = req.params.id;
      if (!req.body.password) {
        const member = await Admins.findByIdAndUpdate(id, {
          profile_image: profile_image,
        });
      }
      if (!req.body.admin_password) {
        const admin_new = await Admins.findByIdAndUpdate(id, req.body);
      } else {
        const salt = await bcrypt.genSalt(Number(process.env.SALT));
        const hashPassword = await bcrypt.hash(req.body.admin_password, salt);
        const new_passwordadmin = await Admins.findByIdAndUpdate(id, {
          ...req.body,
          admin_password: hashPassword,
        });
        return res
          .status(200)
          .send({ message: "แก้ไขผู้ใช้งานนี้เรียบร้อยเเล้ว", status: true });
      }
    });
  } catch (error) {
    return res.status(500).send({ status: false, error: error.message });
  }
};
exports.deleteAdmins = async (req, res) => {
  try {
    const id = req.params.id;
    const admin = await Admins.findByIdAndDelete(id);
    if (!admin) {
      return res
        .status(404)
        .send({ status: false, message: "ไม่พบผู้ใช้งานในระบบ" });
    } else {
      return res
        .status(200)
        .send({ status: true, message: "ลบข้อผู้ใช้สำเร็จ" });
    }
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, message: "มีบางอย่างผิดพลาด" });
  }
};
exports.getAdminAll = async (req, res) => {
  try {
    const admin = await Admins.find();
    if (!admin) {
      return res
        .status(404)
        .send({ status: false, message: "ไม่พบผู้ใช้งานในระบบ" });
    } else {
      return res
        .status(200)
        .send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: admin });
    }
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, message: "มีบางอย่างผิดพลาด" });
  }
};
exports.getAdminsById = async (req, res) => {
  try {
    const id = req.params.id;
    const admin = await Admins.findById(id);
    if (!admin) {
      return res
        .status(404)
        .send({ status: false, message: "ไม่พบผู้ใช้งานในระบบ" });
    } else {
      return res
        .status(200)
        .send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: admin });
    }
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, message: "มีบางอย่างผิดพลาด" });
  }
};
async function adminnumber(date) {
  const admin = await Admins.find();
  let admin_number = null;
  if (admin.length !== 0) {
    let data = "";
    let num = 0;
    let check = null;
    do {
      num = num + 1;
      data = `ADMIN${dayjs(date).format("YYYYMMDD")}`.padEnd(10, "0") + num;
      check = await Admins.find({ adminnumber: data });
      if (check.length === 0) {
        admin_number =
          `ADMIN${dayjs(date).format("YYYYMMDD")}`.padEnd(10, "0") + num;
      }
    } while (check.length !== 0);
  } else {
    admin_number =
      `ADMIN${dayjs(date).format("YYYYMMDD")}`.padEnd(10, "0") + "1";
  }
  return admin_number;
}
