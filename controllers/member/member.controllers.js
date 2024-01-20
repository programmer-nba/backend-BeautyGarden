const bcrypt = require("bcrypt");
const dayjs = require("dayjs");
const Joi = require("joi");
const { Member, validatemember } = require("../../models/member/member.models");
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

exports.createMember = async (req, res) => {
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
      const { error } = validatemember(req.body);
      if (error)
        return res
          .status(400)
          .send({ message: error.details[0].message, status: false });

      const user = await Member.findOne({
        member_username: req.body.member_username,
      });
      if (user) {
        return res
          .status(409)
          .send({ status: false, message: "username นี้มีคนใช้แล้ว" });
      }

      const membernumber1 = await membernumber();
      const salt = await bcrypt.genSalt(Number(process.env.SALT));
      const hashPassword = await bcrypt.hash(req.body.member_password, salt);
      const members = new Member({
        member_number :membernumber1,
        profile_image: profile_image,
        member_username: req.body.member_username,
        member_name: req.body.member_name,
        member_lastname: req.body.member_lastname,
        member_password: hashPassword,
        member_position: req.body.member_position,
        member_idcard: req.body.member_idcard,
        member_birthday: req.body.member_birthday,
        member_email: req.body.member_email,
        member_phone: req.body.member_phone,
        member_type: req.body.member_type,
      });
      const add = await members.save();
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
exports.EditMember = async (req, res) => {
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
      const user = await Member.findOne({
        member_username: req.body.member_username,
      });
      if (user) {
        return res
          .status(409)
          .send({ status: false, message: "username นี้มีคนใช้แล้ว" });
      }
      const id = req.params.id;
      if (!req.body.password) {
        const member = await Member.findByIdAndUpdate(id, {
          profile_image: profile_image,
        });
      }
      if (!req.body.member_username) {
        const admin_new = await Member.findByIdAndUpdate(id, req.body);
      } else {
        const salt = await bcrypt.genSalt(Number(process.env.SALT));
        const hashPassword = await bcrypt.hash(req.body.member_password, salt);
        const new_passwordadmin = await Member.findByIdAndUpdate(id, {
          ...req.body,
          member_password: hashPassword,
        });
        console.log();
        return res
          .status(200)
          .send({ message: "แก้ไขผู้ใช้งานนี้เรียบร้อยเเล้ว", status: true });
      }
    });
  } catch (error) {
    return res.status(500).send({ status: false, error: error.message });
  }
};
exports.deleteMember = async (req, res) => {
  try {
    const id = req.params.id;
    const member = await Member.findByIdAndDelete(id);
    if (!member) {
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
exports.getMemberAll = async (req, res) => {
  try {
    const admin = await Member.find();
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
exports.getMemberById = async (req, res) => {
  try {
    const id = req.params.id;
    const admin = await Member.findById(id);
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

async function membernumber(date) {
  const member = await Member.find();
  let member_number = null;
  if (member.length !== 0) {
    let data = "";
    let num = 0;
    let check = null;
    do {
      num = num + 1;
      data = `BM${dayjs(date).format("YYYYMMDD")}`.padEnd(10, "0") + num;
      check = await Member.find({ adminnumber: data });
      if (check.length === 0) {
        member_number =
          `BM${dayjs(date).format("YYYYMMDD")}`.padEnd(10, "0") + num;
      }
    } while (check.length !== 0);
  } else {
    member_number =
      `BM${dayjs(date).format("YYYYMMDD")}`.padEnd(10, "0") + "1";
  }
  return member_number;
}
