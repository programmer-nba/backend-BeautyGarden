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
        admin_username: req.body.admin_username,
      });
      if (user) {
        return res
          .status(409)
          .send({ status: false, message: "username นี้มีคนใช้แล้ว" });
      }
      const salt = await bcrypt.genSalt(Number(process.env.SALT));
      const hashPassword = await bcrypt.hash(req.body.admin_password, salt);
      const members = new Member({
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
