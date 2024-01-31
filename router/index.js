const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authAdmin = require("../lib/auth.admin");
const authMe = require("../lib/authMe");
const { Admins, validateAdmin } = require("../models/admin/admin.models");
const { Member, validatemember } = require("../models/member/member.models");
const {
  Customer,
} = require("../models/customer/customer.models");
const {
  Accountant,
  validateAccountant,
} = require("../models/accountant/accountant.models");
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
router.get("/me", authMe, async (req, res) => {
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
    if (decoded && decoded.row === "member") {
      const id = decoded._id;
      const member = await Member.findOne({ _id: id });
      console.log(member);
      if (!member) {
        return res
          .status(400)
          .send({ message: "มีบางอย่างผิดพลาด", status: false });
      } else {
        return res.status(200).send({
          name: member.member_name,
          username: member.member_username,
          position: member.member_position,
          level: member.member_role,
        });
      }
      member;
    }
    if (decoded && decoded.row === "customer") {
      const id = decoded._id;
      const customer = await Customer.findOne({ _id: id });
      console.log(customer);
      if (!customer) {
        return res
          .status(400)
          .send({ message: "มีบางอย่างผิดพลาด", status: false });
      } else {
        return res.status(200).send({
          name: customer.member_name,
          username: customer.customer_username,
          position: customer.customer_position,
          level: customer.customer_role,
        });
      }
      customer;
    }
    if (decoded && decoded.row === "accountant") {
      const id = decoded._id;
      const accountant = await Accountant.findOne({ _id: id });
      console.log(accountant);
      if (!accountant) {
        return res
          .status(400)
          .send({ message: "มีบางอย่างผิดพลาด", status: false });
      } else {
        return res.status(200).send({
          name: accountant.accountant_name,
          username: accountant.accountant_username,
          position: accountant.accountant_position,
        });
      }
      accountant;
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
      return await checkCustomer(req, res);
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
const checkCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOne({
      customer_username: req.body.username,
    });
    if (!customer) return await checkAccountant(req, res);
    // if (!manager) {
    //   // await checkEmployee(req, res);
    //   console.log("123456");
    // }
    const validPasswordCustomer = await bcrypt.compare(
      req.body.password,
      customer.customer_password
    );
    if (!validPasswordCustomer) {
      // รหัสไม่ตรง
      return res.status(401).send({
        message: "password is not find",
        status: false,
      });
    } else {
      const token = customer.generateAuthToken();
      const ResponesData = {
        name: customer.customer_username,
        username: customer.customer_password,
        // shop_id: cashier.cashier_shop_id,
      };
      return res.status(200).send({
        status: true,
        token: token,
        message: "เข้าสู่ระบบสำเร็จ",
        result: ResponesData,
        level: "manager",
        position: customer.customer_role,
      });
    }
  } catch (error) {
    return res
      .status(500)
      .send({ message: "Internal Server Error", status: false });
  }
};
const checkAccountant = async (req, res) => {
  try {
    const accountant = await Accountant.findOne({
      accountant_username: req.body.username,
    });
    // if (!manager) return await checkEmployee(req, res);
    // if (!manager) {
    //   // await checkEmployee(req, res);
    //   console.log("123456");
    // }
    const validPasswordaccountant = await bcrypt.compare(
      req.body.password,
      accountant.accountant_password
    );
    if (!validPasswordaccountant) {
      // รหัสไม่ตรง
      return res.status(401).send({
        message: "password is not find",
        status: false,
      });
    } else {
      const token = accountant.generateAuthToken();
      const ResponesData = {
        name: accountant.accountant_name,
        tel: accountant.accountant_tel,
        // shop_id: cashier.cashier_shop_id,
      };
      return res.status(200).send({
        status: true,
        token: token,
        message: "เข้าสู่ระบบสำเร็จ",
        result: ResponesData,
        level: "accountant",
      });
    }
  } catch (error) {
    return res
      .status(500)
      .send({ message: "Internal Server Error", status: false });
  }
};
module.exports = router;
