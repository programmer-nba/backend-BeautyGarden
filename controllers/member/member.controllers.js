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
      const user = await Member.findOne({
        member_username: req.body.member_username,
      })
      if (user) {
        return res
          .status(409)
          .send({ status: false, message: "username นี้มีคนใช้แล้ว" });
      }
      const salt = await bcrypt.genSalt(Number(process.env.SALT));
      const hashPassword = await bcrypt.hash(req.body.member_password, salt);
      const members = new Member({
        member_username: req.body.member_username,
        member_name: req.body.member_name,
        member_lastname: req.body.member_lastname,
        member_password: hashPassword,
        member_position: req.body.member_position,
        member_phone: req.body.member_phone,
      })
      const add = await members.save()
      return res.status(200).send({
        status: true,
        message: "คุณได้สร้างไอดี user เรียบร้อย",
        data: add,
      });
    
  } catch (error) {
    return res.status(500).send({ status: false, error: error.message });
  }
}
exports.EditMember = async (req, res) => {
  try {
      const id = req.params.id
      if (!req.body.member_password) {
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
exports.deleteAllMember = async (req, res) => {
  try {
    const result = await Member.deleteMany({});

    if (result.deletedCount > 0) {
      return res
        .status(200)
        .send({ status: true, message: "ลบข้อมูลเมมเบอร์ทั้งหมดสำเร็จ" });
    } else {
      return res.status(404).send({
        status: false,
        message: "ไม่พบเมมเมอร์ที่ต้องการลบ",
      });
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
      check = await Member.find({ member_number: data });
      if (check.length === 0) {
        member_number =
          `BM${dayjs(date).format("YYYYMMDD")}`.padEnd(10, "0") + num;
      }
    } while (check.length !== 0);
  } else {
    member_number = `BM${dayjs(date).format("YYYYMMDD")}`.padEnd(10, "0") + "1";
  }
  return member_number;
}
