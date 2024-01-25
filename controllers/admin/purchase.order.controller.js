const bcrypt = require("bcrypt");
const dayjs = require("dayjs");
const Joi = require("joi");
const { google } = require("googleapis");
const { default: axios } = require("axios");
const req = require("express/lib/request.js");
const { Admins, validateAdmin } = require("../../models/admin/admin.models");
const { Invoice } = require("../../models/admin/invoice.models");
const { Quotation } = require("../../models/admin/quotation.models");
const { PurchaseOrder } = require("../../models/admin/purchase.order.models");
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

exports.purchaseOrder = async (req, res) => {
  try {
    const purchaseOrderID = req.body.purchaseOrderID || req.body;
    const quotationData = await Quotation.findOne({ _id: purchaseOrderID });
    const purchaseOrder = await purchaseOrderNumber();
    const { _id, timestamps, vat, discount, ...receiptDataFields } =
      quotationData.toObject();
    console.log(quotationData);
    const total = quotationData.total;

    // กำหนดค่า ShippingCost เป็น 0 หากไม่ได้ระบุค่า
    const ShippingCost = req.body.ShippingCost || 0;

    const net = discount ? total - discount : total;
    const vatPercentage = 0.07; // VAT rate (7%)

    const vatAmount = net * vatPercentage;
    const totalExcludingVAT = net - vatAmount;
    const totalvat = (vatAmount + net).toFixed(2);
    const Shippingincluded = (
      parseFloat(totalvat) + parseFloat(ShippingCost)
    ).toFixed(2);

    const savedReceiptData = await PurchaseOrder.create({
      ...receiptDataFields,
      purchase_order: purchaseOrder,
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
exports.PrintPOVat = async (req, res) => {
  try {
    const {
      product_detail,
      ShippingCost,
      note,
      discount,
      start_date,
      end_date,
      quotation,
      invoice,
    } = req.body;

    // เพิ่มเงื่อนไขกำหนดค่าเริ่มต้นของ ShippingCost เป็น 0 ถ้าไม่มีค่า
    const FistShippingCost = ShippingCost || 0;

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
    const purchaseOrder = await purchaseOrderNumber();

    // ใช้ค่าที่ได้จากเงื่อนไข ShippingCost ที่ถูกปรับแล้ว
    const Shippingincluded = (totalWithVat + FistShippingCost).toFixed(2);
    const PurchaseOrder1 = await new PurchaseOrder({
      ...req.body,
      customer_detail: {
        ...req.body.customer_detail,
      },
      purchase_order: purchaseOrder,
      discount: discount.toFixed(2),
      net: net,
      ShippingCost: FistShippingCost,
      Shippingincluded: Shippingincluded,
      product_detail: updatedProductDetail,
      total: total.toFixed(2),
      vat: vatAmount.toFixed(2),
      totalvat: totalWithVat.toFixed(2),
      timestamps: dayjs(Date.now()).format(""),
    }).save();

    if (PurchaseOrder1) {
      return res.status(200).send({
        status: true,
        message: "สร้างใบสั่งชื้อสินค้าสำเร็จ",
        data: PurchaseOrder1,
      });
    } else {
      return res.status(500).send({
        message: PurchaseOrder1,
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

async function purchaseOrderNumber(date) {
  const number = await PurchaseOrder.find();
  let purchaseOrder_number = null;
  if (number.length !== 0) {
    let data = "";
    let num = 0;
    let check = null;
    do {
      num = num + 1;
      data = `PO${dayjs(date).format("YYYYMMDD")}`.padEnd(15, "0") + num;
      check = await PurchaseOrder.find({ purchase_order: data });
      if (check.length === 0) {
        purchaseOrder_number =
          `PO${dayjs(date).format("YYYYMMDD")}`.padEnd(15, "0") + num;
      }
    } while (check.length !== 0);
  } else {
    purchaseOrder_number =
      `PO${dayjs(date).format("YYYYMMDD")}`.padEnd(15, "0") + "1";
  }
  return purchaseOrder_number;
}
