const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authAdmin = require("../lib/auth.admin")
const {Admins,validateAdmin} =require("../models/admin/admin.models")
require("dotenv").config();

router.post("/login", async (req, res) => {
  try {
    const admin = await Admins.findOne({
      admin_username: req.body.username,
    });
    // if (!admin) return await checkManager(req, res);
    // if (!admin) {
    //   // await checkManager(req, res);
    //   console.log("Manager");
    // }
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
module.exports = router;
