const bcrypt = require("bcrypt");
const dayjs = require("dayjs");
const Joi = require("joi");
const { google } = require("googleapis");
const { default: axios } = require("axios");
const req = require("express/lib/request.js");
const { Admins, validateAdmin } = require("../../models/admin/admin.models");
const { Invoice } = require("../../models/admin/invoice.models");
const { Quotation } = require("../../models/admin/quotation.models");
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

exports.ReceiptInvoiceVat = async (req, res) => {
  try {
    const quotationID = req.body.quotationID || req.body;
    const quotationData = await Quotation.findOne({ _id: quotationID });
    const invoice = await invoiceNumber();
    const { _id, timestamps, vat, discount, ...receiptDataFields } =
      quotationData.toObject();

    const total = quotationData.total;
    const ShippingCost = req.body.ShippingCost || 0;
    const net = discount ? total - discount : total;
    const vatPercentage = 0.07; // VAT rate (7%)
    const vatAmount = net * vatPercentage;
    const totalExcludingVAT = net - vatAmount;
    const totalvat = (vatAmount + net).toFixed(2);
    const Shippingincluded = (
      parseFloat(totalvat) + parseFloat(ShippingCost)
    ).toFixed(2);

    const savedReceiptData = await Invoice.create({
      ...receiptDataFields,
      invoice: invoice,
      quotation: quotationData.quotation,
      discount: discount.toFixed(2),
      net: net.toFixed(2),
      vat: vatAmount.toFixed(2),
      totalvat: (vatAmount + net).toFixed(2),
      ShippingCost: ShippingCost,
      Shippingincluded: Shippingincluded,
      start_date: req.body.start_date,
      end_date: req.body.end_date,
      note: req.body.note,
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
exports.PrintInviuceVat = async (req, res) => {
  try {
    const {
      product_detail,
      ShippingCost = 0,
      note,
      discount = 0,
      start_date,
      end_date,
      quotation,
      invoice,
    } = req.body;
    let total = 0;
    const updatedProductDetail = product_detail.map((product) => {
      const price = product.product_price;
      const amount = product.product_amount;
      const product_total = (price * amount).toFixed(2);
      total += +product_total;
      return {
        ...product,
        product_total,
      };
    });

    const net = discount ? total - discount : total;
    const vatRate = 0.07;
    const vatAmount = net * vatRate;
    const totalWithVat = net + vatAmount;
    const invoice1 = await invoiceNumber();
    const Shippingincluded = (totalWithVat + ShippingCost).toFixed(2);
    const quotation1 = await new Invoice({
      ...req.body,
      customer_detail: {
        ...req.body.customer_detail,
      },
      receipt: invoice1,
      discount: discount.toFixed(2),
      net: net,
      ShippingCost: ShippingCost,
      Shippingincluded: Shippingincluded,
      product_detail: updatedProductDetail,
      total: total.toFixed(2),
      vat: vatAmount.toFixed(2),
      totalvat: totalWithVat.toFixed(2),
      timestamps: dayjs(Date.now()).format(""),
    }).save();

    if (quotation1) {
      return res.status(200).send({
        status: true,
        message: "สร้างใบเสร็จรับเงินสำเร็จ",
        data: quotation1,
      });
    } else {
      return res.status(500).send({
        message: quotation1,
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
exports.deleteInvoice = async (req, res) => {
  try {
    const id = req.params.id;
    const receipt = await Invoice.findByIdAndDelete(id);
    if (!receipt) {
      return res
        .status(404)
        .send({ status: false, message: "ไม่พบใบเเจ้งหนี้" });
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
exports.deleteAllInvoice = async (req, res) => {
  try {
    const result = await Invoice.deleteMany({});

    if (result.deletedCount > 0) {
      return res
        .status(200)
        .send({ status: true, message: "ลบข้อมูลใบเเจ้งหนี้สำเร็จ" });
    } else {
      return res.status(404).send({ status: false, message: "ไม่พบใบเสร็จ" });
    }
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, message: "มีบางอย่างผิดพลาด" });
  }
};
exports.getInvoiceVatAll = async (req, res) => {
  try {
    const invoice = await Invoice.find();
    if (!invoice) {
      return res
        .status(404)
        .send({ status: false, message: "ไม่พบใบเเจ้งหนี้" });
    } else {
      return res
        .status(200)
        .send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: invoice });
    }
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, message: "มีบางอย่างผิดพลาด" });
  }
};
exports.getInvoiceVatById = async (req, res) => {
  try {
    const id = req.params.id;
    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return res
        .status(404)
        .send({ status: false, message: "ไม่พบใบเเจ้งหนี้" });
    } else {
      return res
        .status(200)
        .send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: invoice });
    }
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, message: "มีบางอย่างผิดพลาด" });
  }
};
exports.getIVVatByIdS = async (req, res) => {
  try {
    const id = req.params.id;
    const invoice = await Invoice.findOne({ invoice: id });
    if (!invoice) {
      return res
        .status(404)
        .send({ status: false, message: "ไม่พบใบเเจ้งหนี้" });
    } else {
      return res
        .status(200)
        .send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: invoice });
    }
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, message: "มีบางอย่างผิดพลาด" });
  }
};
exports.getIVAllfilter = async (req, res) => {
  try {
    const iv = await Invoice.find({}, { _id: 1, invoice: 1 });
    if (!iv || iv.length === 0) {
      return res
        .status(404)
        .send({ status: false, message: "ไม่พบข้อมูลใบสั่งซื้อ" });
    } else {
      return res
        .status(200)
        .send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: iv });
    }
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, message: "มีบางอย่างผิดพลาด" });
  }
};

async function invoiceNumber(date) {
  const number = await Invoice.find();
  let invoice_number = null;
  if (number.length !== 0) {
    let data = "";
    let num = 0;
    let check = null;
    do {
      num = num + 1;
      data = `IV${dayjs(date).format("YYYYMMDD")}`.padEnd(15, "0") + num;
      check = await Invoice.find({ invoice: data });
      if (check.length === 0) {
        invoice_number =
          `IV${dayjs(date).format("YYYYMMDD")}`.padEnd(15, "0") + num;
      }
    } while (check.length !== 0);
  } else {
    invoice_number =
      `IV${dayjs(date).format("YYYYMMDD")}`.padEnd(15, "0") + "1";
  }
  return invoice_number;
}
