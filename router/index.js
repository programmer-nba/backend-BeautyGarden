const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authAdmin = require("../lib/auth.admin");
const { Admins, validateAdmin } = require("../models/admin/admin.models");
const {Member , validatemember} =require("../models/member/member.models")
require("dotenv").config();

router.post("/login", async (req, res) => {
  try {
    const admin = await Admins.findOne({
      admin_username: req.body.username,
    });
    if (!admin) return await checkMember(req, res);
    if (!admin) {
      // await checkManager(req, res);
      console.log("member");
    }
    const validPasswordAdmin = await bcrypt.compare(
      req.body.password,
      admin.admin_password
    );

    if (!validPasswordAdmin) {
      return res.status(401).send({
        status: false,
        message: "รหัสผ่านไม่ถูกต้อง",
      });
    }
    const token = admin.generateAuthToken();
    const responseData = {
      name: admin.admin_name,
      username: admin.admin_username,
      position: admin.admin_position,
    };

    return res.status(200).send({
      status: true,
      token: token,
      message: "เข้าสู่ระบบสำเร็จ",
      result: responseData,
      level: "admin",
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .send({ status: false, message: "Internal Server Error" });
  }
});
router.get("/me", authAdmin, async (req, res) => {
  try {
    const { decoded } = req;
    if (decoded && decoded.row === "admin") {
      const id = decoded._id;
      const admin = await Admins.findOne({ _id: id });
      if (!admin) {
        return res
          .status(400)
          .send({ message: "มีบางอย่างผิดพลาด", status: false });
      } else {
        return res.status(200).send({
          name: admin.admin_name,
          username: admin.admin_username,
          position: "admin",
          level: admin.admin_position,
        });
      }
    }
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error", status: false });
  }
});
const checkMember = async (req, res) => {
  try {
    const member = await Member.findOne({
      member_username: req.body.username,
    });
    if (!member) {
      console.log("ไม่พบข้อมูลลูกค้า");
    } else {
      const validatemember = await bcrypt.compare(
        req.body.password,
        member.member_password
      );
      if (!validatemember) {
        // รหัสไม่ตรง
        return res.status(401).send({
          message: "password is not find",
          status: false,
        });
      } else {
        const token = member.generateAuthToken();
        const ResponesData = {
          name: member.member_name,
          username: member.member_username,
          // shop_id: cashier.cashier_shop_id,
        };
        return res.status(200).send({
          status: true,
          token: token,
          message: "เข้าสู่ระบบสำเร็จ",
          result: ResponesData,
          level: "Member",
        });
      }
    }
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error", status: false });
  }
};
module.exports = router;
