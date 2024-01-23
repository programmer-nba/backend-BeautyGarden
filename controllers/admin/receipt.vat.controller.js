const bcrypt = require("bcrypt");
const dayjs = require("dayjs");
const Joi = require("joi");
const { google } = require("googleapis");
const { default: axios } = require("axios");
const req = require("express/lib/request.js");
const { Admins, validateAdmin } = require("../../models/admin/admin.models");
const { Quotation } = require("../../models/admin/quotation.models");
const { ReceiptNoVat } = require("../../models/admin/receipt.no.vat.models");
const { ReceiptVat } = require("../../models/admin/receipt.vat.models");
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

exports.ReceiptVat = async (req, res) => {
  try {
    const id = req.body.id || req.body;
    const quotationData = await Quotation.findOne({ _id: id });
    const invoice = await invoiceNumber();
    const { _id, timestamps, vat, discount, ...receiptDataFields } =
      quotationData.toObject();

    const total = quotationData.total;
    const ShippingCost = req.body.ShippingCost;
    const net = discount ? total - discount : total;
    const vatPercentage = 0.07; // VAT rate (7%)

    const vatAmount = net * vatPercentage;
    const totalExcludingVAT = net - vatAmount;
    const totalvat = (vatAmount + net).toFixed(2);
    const Shippingincluded = (
      parseFloat(totalvat) + parseFloat(ShippingCost)
    ).toFixed(2);

    const savedReceiptData = await ReceiptVat.create({
      ...receiptDataFields,
      invoice: invoice,
      discount: discount.toFixed(2),
      net: net.toFixed(2),
      vat: vatAmount.toFixed(2),
      totalvat: (vatAmount + net).toFixed(2),
      ShippingCost: ShippingCost,
      Shippingincluded: Shippingincluded,
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

exports.PrintReceiptVat = async (req, res) => {
  try {
    const { product_detail, ShippingCost, note, discount } = req.body;
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
    const invoice = await invoiceNumber();
    const Shippingincluded = (totalWithVat + ShippingCost).toFixed(2);
    const quotation = await new ReceiptVat({
      ...req.body,
      customer_detail: {
        ...req.body.customer_detail,
      },
      invoice: invoice,
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
exports.deleteReceiptVat = async (req, res) => {
  try {
    const id = req.params.id;
    const receipt = await ReceiptVat.findByIdAndDelete(id);
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
exports.deleteAllReceiptVat = async (req, res) => {
  try {
    const result = await ReceiptVat.deleteMany({});

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
exports.getReceiptVatAll = async (req, res) => {
  try {
    const receipt = await ReceiptVat.find();
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
exports.getReceiptVatById = async (req, res) => {
  try {
    const id = req.params.id;
    const admin = await ReceiptVat.findById(id);
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
exports.EditReceiptVat = async (req, res) => {
  try {
    const id = req.body.id || req.params.id;
    const ShippingCost = req.body.ShippingCost;
    const Receipt = await ReceiptVat.findById(id);
    if (!Receipt) {
      return res.status(404).send({
        status: false,
        message: "Receipt not found",
      });
    }
    const total = Receipt.total;
    const updatedReceiptData = await ReceiptVat.findOneAndUpdate(
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
async function invoiceNumber(date) {
  const order = await ReceiptVat.find();
  let invoice_number = null;
  if (order.length !== 0) {
    let data = "";
    let num = 0;
    let check = null;
    do {
      num = num + 1;
      data = `RECEIPT${dayjs(date).format("YYYYMMDD")}`.padEnd(15, "0") + num;
      check = await ReceiptVat.find({ invoice: data });
      if (check.length === 0) {
        invoice_number =
          `RECEIPT${dayjs(date).format("YYYYMMDD")}`.padEnd(15, "0") + num;
      }
    } while (check.length !== 0);
  } else {
    invoice_number =
      `RECEIPT${dayjs(date).format("YYYYMMDD")}`.padEnd(15, "0") + "1";
  }
  return invoice_number;
}
