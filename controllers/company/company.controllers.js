const bcrypt = require("bcrypt");
const dayjs = require("dayjs");
const Joi = require("joi");
const fs = require("fs");
const { google } = require("googleapis");
const { default: axios } = require("axios");
const req = require("express/lib/request.js");
const { Admins, validateAdmin } = require("../../models/admin/admin.models");
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