const bcrypt = require("bcrypt");
const dayjs = require("dayjs");
const Joi = require("joi");
const { google } = require("googleapis");
const { default: axios } = require("axios");
const req = require("express/lib/request.js");
const {
  Accountant,
  validateAccountant,
} = require("../../models/accountant/accountant.models");
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
      const { error } = validateAccountant(req.body);
      if (error)
        return res
          .status(400)
          .send({ message: error.details[0].message, status: false });

      const user = await Accountant.findOne({
        accountant_username: req.body.accountant_username,
      });
      if (user) {
        return res
          .status(409)
          .send({ status: false, message: "username นี้มีคนใช้แล้ว" });
      }
      const ATNumber = await AccountantNumbernumber();
      const salt = await bcrypt.genSalt(Number(process.env.SALT));
      const hashPassword = await bcrypt.hash(
        req.body.accountant_password,
        salt
      );
      const accountant = new Accountant({
        accountant_number: ATNumber,
        profile_image: profile_image,
        accountant_username: req.body.accountant_username,
        card_number: req.body.card_number,
        accountant_name: req.body.accountant_name,
        accountant_tel: req.body.accountant_tel,
        accountant_password: hashPassword,
        accountant_position: req.body.accountant_position,
      });
      const add = await accountant.save();
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
exports.EditAccountant = async (req, res) => {
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
      const user = await Accountant.findOne({
        accountant_username: req.body.accountant_username,
      });
      if (user) {
        return res
          .status(409)
          .send({ status: false, message: "username นี้มีคนใช้แล้ว" });
      }
      const id = req.params.id;
      if (!req.body.password) {
        const member = await Accountant.findByIdAndUpdate(id, {
          profile_image: profile_image,
        });
      }
      if (!req.body.accountant_password) {
        const admin_new = await Accountant.findByIdAndUpdate(id, req.body);
      } else {
        const salt = await bcrypt.genSalt(Number(process.env.SALT));
        const hashPassword = await bcrypt.hash(
          req.body.accountant_password,
          salt
        );
        const new_passwordadmin = await Accountant.findByIdAndUpdate(id, {
          ...req.body,
          accountant_password: hashPassword,
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
exports.deleteAccountant = async (req, res) => {
  try {
    const id = req.params.id;
    const acc = await Accountant.findByIdAndDelete(id);
    if (!acc) {
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
exports.deleteAllAccountant = async (req, res) => {
  try {
    const result = await Accountant.deleteMany({});

    if (result.deletedCount > 0) {
      return res.status(200).send({
        status: true,
        message: "ลบข้อมูลพนักงานบัญชีทั้งหมดสำเร็จ",
      });
    } else {
      return res.status(404).send({
        status: false,
        message: "ไม่พบข้อมูลลบข้อมูลพนักงานบัญชี",
      });
    }
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, message: "มีบางอย่างผิดพลาด" });
  }
};
exports.getAccountantAll = async (req, res) => {
  try {
    const acc = await Accountant.find();
    if (!acc) {
      return res
        .status(404)
        .send({ status: false, message: "ไม่พบผู้ใช้งานในระบบ" });
    } else {
      return res
        .status(200)
        .send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: acc });
    }
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, message: "มีบางอย่างผิดพลาด" });
  }
};
exports.getAccountantById = async (req, res) => {
  try {
    const id = req.params.id;
    const acc = await Accountant.findById(id);
    if (!acc) {
      return res
        .status(404)
        .send({ status: false, message: "ไม่พบผู้ใช้งานในระบบ" });
    } else {
      return res
        .status(200)
        .send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: acc });
    }
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, message: "มีบางอย่างผิดพลาด" });
  }
};
async function AccountantNumbernumber(date) {
  const accountant = await Accountant.find();
  let accountant_number = null;
  if (accountant.length !== 0) {
    let data = "";
    let num = 0;
    let check = null;
    do {
      num = num + 1;
      data = `AT${dayjs(date).format("YYYYMMDD")}`.padEnd(10, "0") + num;
      check = await Accountant.find({ accountant_number: data });
      if (check.length === 0) {
        accountant_number =
          `AT${dayjs(date).format("YYYYMMDD")}`.padEnd(10, "0") + num;
      }
    } while (check.length !== 0);
  } else {
    accountant_number =
      `AT${dayjs(date).format("YYYYMMDD")}`.padEnd(10, "0") + "1";
  }
  return accountant_number;
}
