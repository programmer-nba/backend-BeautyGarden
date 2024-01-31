const bcrypt = require("bcrypt");
const dayjs = require("dayjs");
const Joi = require("joi");
const { Customer } = require("../../models/customer/customer.models");
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
      const TaxNumber = await checkTaxNumber(req.body.customer_taxnumber);
      if (TaxNumber) {
        return res.status(409).send({
          status: false,
          message: "เลขประจำตัวผู้เสียภาษีนี้มีผู้ใช้แล้ว",
        });
      }
      const NameAndLastName = await checkLastName(
        req.body.customer_name,
      );
      if (NameAndLastName) {
        return res.status(409).send({
          status: false,
          message: "ชื่อและนามสกุลนี้มีผู้ใช้แล้ว",
        });
      }
      const CustomerNumber = await customernumber();
      const customers = new Customer({
        customer_taxnumber: req.body.customer_taxnumber,
        customer_number: CustomerNumber,
        profile_image: profile_image,
        customer_idcard: req.body.customer_idcard,
        customer_name: req.body.customer_name,
        customer_lastname: req.body.customer_lastname,
        customer_phone: req.body.customer_phone,
        customer_position: req.body.customer_position,
        customer_email: req.body.customer_email,
        customer_type: req.body.customer_type,
        customer_birthday: req.body.customer_birthday,
        customer_contact: req.body.customer_contact,
        customer_contact_number: req.body.customer_contact_number,
      });
      const add = await customers.save();
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
exports.EditCustomer = async (req, res) => {
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
      const user = await Customer.findOne({
        customer_username: req.body.customer_username,
      });
      if (user) {
        return res
          .status(409)
          .send({ status: false, message: "username นี้มีคนใช้แล้ว" });
      }
      const id = req.params.id;
      if (!req.body.password) {
        const member = await Customer.findByIdAndUpdate(id, {
          profile_image: profile_image,
        });
      }
      if (!req.body.customer_username) {
        const admin_new = await Customer.findByIdAndUpdate(id, req.body);
      } else {
        const salt = await bcrypt.genSalt(Number(process.env.SALT));
        const hashPassword = await bcrypt.hash(
          req.body.customer_password,
          salt
        );
        const new_passwordadmin = await Customer.findByIdAndUpdate(id, {
          ...req.body,
          customer_password: hashPassword,
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
exports.deleteCustomer = async (req, res) => {
  try {
    const id = req.params.id;
    const customer = await Customer.findByIdAndDelete(id);
    if (!customer) {
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
exports.getCustomerAll = async (req, res) => {
  try {
    const customer = await Customer.find();
    if (!customer) {
      return res
        .status(404)
        .send({ status: false, message: "ไม่พบผู้ใช้งานในระบบ" });
    } else {
      return res
        .status(200)
        .send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: customer });
    }
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, message: "มีบางอย่างผิดพลาด" });
  }
};
exports.getCustomerById = async (req, res) => {
  try {
    const id = req.params.id;
    const customer = await Customer.findById(id);
    if (!customer) {
      return res
        .status(404)
        .send({ status: false, message: "ไม่พบผู้ใช้งานในระบบ" });
    } else {
      return res
        .status(200)
        .send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: customer });
    }
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, message: "มีบางอย่างผิดพลาด" });
  }
};

async function customernumber(date) {
  const customer = await Customer.find();
  let customer_number = null;
  if (customer.length !== 0) {
    let data = "";
    let num = 0;
    let check = null;
    do {
      num = num + 1;
      data = `CS${dayjs(date).format("YYYYMMDD")}`.padEnd(10, "0") + num;
      check = await Customer.find({ customer_number: data });
      if (check.length === 0) {
        customer_number =
          `CS${dayjs(date).format("YYYYMMDD")}`.padEnd(10, "0") + num;
      }
    } while (check.length !== 0);
  } else {
    customer_number =
      `CS${dayjs(date).format("YYYYMMDD")}`.padEnd(10, "0") + "1";
  }
  return customer_number;
}

const checkTaxNumber = async (taxNumber) => {
  const CustomerTaxNumber = await Customer.findOne({
    customer_taxnumber: taxNumber,
  });
  return !!CustomerTaxNumber;
};
const checkLastName = async (name, lastName) => {
  const existingCustomer = await Customer.findOne({
    customer_name: name,
  });
  return !!existingCustomer;
};
