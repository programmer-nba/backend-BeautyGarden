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
    const id = req.body.id || req.body;
    const quotationData = await Quotation.findOne({ _id: id });
    const invoice = await invoiceNumber();
    const { _id, timestamps, ...receiptDataFields } = quotationData.toObject();

    const total = quotationData.total;
    const ShippingCost = req.body.ShippingCost;

    const savedReceiptData = await ReceiptNoVat.create({
      ...receiptDataFields,
      ShippingCost: ShippingCost,
      Shippingincluded: (total + ShippingCost).toFixed(2),
      note: req.body.note,
      invoice: invoice,
    });

    return res.status(200).send({
      status: true,
      message: "บันทึกข้อมูลสำเร็จ",
      data: savedReceiptData,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send({
      status: false,
      message: "มีบางอย่างผิดพลาด",
      error: err.message,
    });
  }
};
exports.PrintReceiptNoVat = async (req, res) => {
  try {
    const { product_detail, ShippingCost, note } = req.body;
    let total = 0;
    const updatedProductDetail = product_detail.map((product) => {
      const price = product.product_price;
      const amount = product.product_amount;
      const product_total = (price * amount).toFixed(2);
      total += +product_total; // ให้มี + หน้าตัวแปรเพื่อแปลงเป็นตัวเลข
      return {
        ...product,
        product_total,
      };
    });

    const Shippingincluded = (total + ShippingCost).toFixed(2);
    const invoice = await invoiceNumber();
    const quotation = await new ReceiptNoVat({
      ...req.body,
      invoice: invoice,
      customer_detail: {
        ...req.body.customer_detail,
      },
      ShippingCost: ShippingCost,
      Shippingincluded: Shippingincluded,
      product_detail: updatedProductDetail,
      total: total.toFixed(2),
      timestamps: dayjs(Date.now()).format(""),
    }).save();

    if (quotation) {
      return res.status(200).send({
        status: true,
        message: "สร้างใบเสนอราคาสำเร็จ",
        data: quotation,
      });
    } else {
      return res.status(500).send({
        message: quotation,
        status: false,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      message: "มีบางอย่างผิดพลาด",
      status: false,
      error: error.message,
    });
  }
};
exports.EditReceiptNoVat = async (req, res) => {
  try {
    const id = req.body.id || req.params.id;
    const ShippingCost = req.body.ShippingCost;
    const Receipt = await ReceiptNoVat.findById(id);
    if (!Receipt) {
      return res.status(404).send({
        status: false,
        message: "Receipt not found",
      });
    }
    const total = Receipt.total;
    const updatedReceiptData = await ReceiptNoVat.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          ShippingCost: ShippingCost,
          Shippingincluded: (total + ShippingCost).toFixed(2),
          note: req.body.note,
        },
      },
      { new: true }
    );
    return res.status(200).send({
      status: true,
      message: "แก้ไขข้อมูลสำเร็จ",
      data: updatedReceiptData,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send({
      status: false,
      message: "มีบางอย่างผิดพลาด",
      error: err.message,
    });
  }
};
exports.getReceiptAll = async (req, res) => {
  try {
    const receipt = await ReceiptNoVat.find();
    if (!receipt) {
      return res
        .status(404)
        .send({ status: false, message: "ไม่พบข้อมูลใบเสร้จ" });
    } else {
      return res
        .status(200)
        .send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: receipt });
    }
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, message: "มีบางอย่างผิดพลาด" });
  }
};
exports.getReceiptById = async (req, res) => {
  try {
    const id = req.params.id;
    const admin = await ReceiptNoVat.findById(id);
    if (!admin) {
      return res
        .status(404)
        .send({ status: false, message: "ไม่พบข้อมูลใบเสร็จ" });
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
exports.deleteReceipt = async (req, res) => {
  try {
    const id = req.params.id;
    const receipt = await ReceiptNoVat.findByIdAndDelete(id);
    if (!receipt) {
      return res.status(404).send({ status: false, message: "ไม่พบใบเสร็จ" });
    } else {
      return res
        .status(200)
        .send({ status: true, message: "ลบข้อมูลใบเสร็จสำเร็จ" });
    }
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, message: "มีบางอย่างผิดพลาด" });
  }
};
exports.deleteAllReceipt = async (req, res) => {
  try {
    const result = await ReceiptNoVat.deleteMany({});

    if (result.deletedCount > 0) {
      return res
        .status(200)
        .send({ status: true, message: "ลบข้อมูลใบเสร็จทั้งหมด" });
    } else {
      return res.status(404).send({ status: false, message: "ไม่พบใบเสร็จ" });
    }
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
      check = await ReceiptNoVat.find({ invoice: data });
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
