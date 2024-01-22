const bcrypt = require("bcrypt");
const dayjs = require("dayjs");
const Joi = require("joi");
const { google } = require("googleapis");
const { default: axios } = require("axios");
const req = require("express/lib/request.js");
const { Admins, validateAdmin } = require("../../models/admin/admin.models");
const { Quotation } = require("../../models/admin/quotation.models");
const { ReceiptNoVat } = require("../../models/admin/receipt.no.vat.models");
const {
  Customer,
  validateCustomer,
} = require("../../models/customer/customer.models");
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

exports.ReceiptNoVat = async (req, res) => {
  try {
    const quotationData = await Quotation.findById(req.params.id);
    if (!quotationData) {
      return res.status(404).send({ status: false, message: "ไม่พบข้อมูล" });
    }
    const invoice = await invoiceNumber();
    const { _id, timestamps, ...receiptDataFields } = quotationData.toObject();
    const savedReceiptData = await ReceiptNoVat.create({
      ...receiptDataFields,
      ShippingCost: req.body.ShippingCost,
      note: req.body.note,
      invoice:invoice
    });
    return res.status(200).send({
      status: true,
      message: "บันทึกข้อมูลสำเร็จ",
      data: savedReceiptData,
    });
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, message: "มีบางอย่างผิดพลาด" });
  }
};
async function invoiceNumber(date) {
    const order = await ReceiptNoVat.find();
    let invoice_number = null;
    if (order.length !== 0) {
      let data = "";
      let num = 0;
      let check = null;
      do {
        num = num + 1;
        data = `INVOICE${dayjs(date).format("YYYYMMDD")}`.padEnd(15, "0") + num;
        check = await ReceiptNoVat.find({invoice: data});
        if (check.length === 0) {
          invoice_number =
            `INVOICE${dayjs(date).format("YYYYMMDD")}`.padEnd(15, "0") + num;
        }
      } while (check.length !== 0);
    } else {
      invoice_number =
        `INVOICE${dayjs(date).format("YYYYMMDD")}`.padEnd(15, "0") + "1";
    }
    return invoice_number;
  }