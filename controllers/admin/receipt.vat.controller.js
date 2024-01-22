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
    const { _id, timestamps, vat, ...receiptDataFields } =
      quotationData.toObject();

    const total = quotationData.total;
    const ShippingCost = req.body.ShippingCost;

    const vatPercentage = 0.07; // VAT rate (7%)
    const vatAmount = quotationData.total * vatPercentage;
    const totalExcludingVAT = quotationData.total - vatAmount;
    const totalIncludedShipping = totalExcludingVAT + ShippingCost;

    const savedReceiptData = await ReceiptVat.create({
      ...receiptDataFields,
      ShippingCost: ShippingCost,
      Shippingincluded: (total + ShippingCost).toFixed(2),
      vat: vatAmount.toFixed(2),
      totalvat: (total + vatAmount).toFixed(2),
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
    const quotation = await new ReceiptVat({
      ...req.body,
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
