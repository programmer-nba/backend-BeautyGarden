const bcrypt = require("bcrypt");
const dayjs = require("dayjs");
const Joi = require("joi");
const { google } = require("googleapis");
const { default: axios } = require("axios");
const req = require("express/lib/request.js");
const { Admins, validateAdmin } = require("../../models/admin/admin.models");
const { Quotation } = require("../../models/admin/quotation.models");
const { Invoice } = require("../../models/admin/invoice.models");
const { ReceiptNoVat } = require("../../models/admin/receipt.no.vat.models");
const { ReceiptVat } = require("../../models/admin/receipt.vat.models");
const { Signature } = require("../../models/signature/signature.models");
const {
  DeliveryTaxInvoice,
} = require("../../models/admin/Delivery.Tax.Invoice.models");
const {
  Customer,
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

exports.ReceiptDTVat = async (req, res) => {
  try {
    const invoiceID = req.body.invoiceID || req.body;
    const signatureID = req.body.signatureID || req.body;

    const signatureData = await Signature.findOne({ _id: signatureID });
    const quotationData = await Invoice.findOne({ _id: invoiceID });
    const invoiceOT = await invoiceOTNumber();
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

    const savedReceiptData = await DeliveryTaxInvoice.create({
      ...receiptDataFields,
      signature: {
        name: signatureData.name,
        image_signature: signatureData.image_signature,
        position: signatureData.position,
      },
      delivery_tax_invoice: invoiceOT,
      quotation: quotationData.quotation,
      invoice: quotationData.invoice,
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
exports.PrintOTVat = async (req, res) => {
  try {
    const {
      product_detail,
      ShippingCost = 0,
      note,
      discount = 0,
      start_date,
      end_date,
      quotation,
      signatureID,
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
    const invoiceOT = await invoiceOTNumber();

    let signatureData = {};
    if (signatureID) {
      signatureData = await Signature.findOne({ _id: signatureID });
    }
    const Shippingincluded = (totalWithVat + ShippingCost).toFixed(2);
    const quotation1 = await new DeliveryTaxInvoice({
      ...req.body,
      customer_detail: {
        ...req.body.customer_detail,
      },
      signature: {
        name: signatureData.name,
        image_signature: signatureData.image_signature,
        position: signatureData.position,
      },
      delivery_tax_invoice: invoiceOT,
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
exports.getDTAll = async (req, res) => {
  try {
    const DT = await DeliveryTaxInvoice.find();
    if (!DT) {
      return res.status(404).send({
        status: false,
        message: "ไม่พบข้อมูลรายการ ใบส่งของ เเละ รายการใบกำกับภาษี",
      });
    } else {
      return res
        .status(200)
        .send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: DT });
    }
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, message: "มีบางอย่างผิดพลาด" });
  }
};
exports.getDTById = async (req, res) => {
  try {
    const id = req.params.id;
    const DT = await DeliveryTaxInvoice.findById(id);
    if (!DT) {
      return res.status(404).send({
        status: false,
        message: "ไม่พบข้อมูลรายการ ใบส่งของ เเละ รายการใบกำกับภาษี",
      });
    } else {
      return res
        .status(200)
        .send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: DT });
    }
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, message: "มีบางอย่างผิดพลาด" });
  }
};
exports.getDTByIdDT = async (req, res) => {
  try {
    const id = req.params.id;
    const DT = await DeliveryTaxInvoice.findOne({ delivery_tax_invoice: id });
    if (!DT) {
      return res.status(404).send({
        status: false,
        message: "ไม่พบข้อมูลรายการ ใบส่งของ เเละ รายการใบกำกับภาษี",
      });
    } else {
      return res
        .status(200)
        .send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: DT });
    }
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, message: "มีบางอย่างผิดพลาด" });
  }
};
exports.deleteDT = async (req, res) => {
  try {
    const id = req.params.id;
    const receipt = await DeliveryTaxInvoice.findByIdAndDelete(id);
    if (!receipt) {
      return res.status(404).send({
        status: false,
        message: "ไม่พบข้อมูลรายการ ใบส่งของ เเละ รายการใบกำกับภาษี",
      });
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
exports.deleteAllDT = async (req, res) => {
  try {
    const result = await DeliveryTaxInvoice.deleteMany({});

    if (result.deletedCount > 0) {
      return res.status(200).send({
        status: true,
        message: "ลบข้อมูลใบเสร็จสำเร็จ",
      });
    } else {
      return res.status(404).send({
        status: false,
        message: "ไม่พบข้อมูลรายการ ใบส่งของ เเละ รายการใบกำกับภาษี",
      });
    }
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, message: "มีบางอย่างผิดพลาด" });
  }
};
exports.getDTAllfilter = async (req, res) => {
  try {
    const dt = await DeliveryTaxInvoice.find(
      {},
      { _id: 1, delivery_tax_invoice: 1 }
    );
    if (!dt || dt.length === 0) {
      return res
        .status(404)
        .send({ status: false, message: "ไม่พบข้อมูลใบสั่งซื้อ" });
    } else {
      return res
        .status(200)
        .send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: dt });
    }
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, message: "มีบางอย่างผิดพลาด" });
  }
};
async function invoiceOTNumber(date) {
  const order = await DeliveryTaxInvoice.find();
  let invoice_number = null;
  if (order.length !== 0) {
    let data = "";
    let num = 0;
    let check = null;
    do {
      num = num + 1;
      data = `OT${dayjs(date).format("YYYYMMDD")}`.padEnd(15, "0") + num;
      check = await DeliveryTaxInvoice.find({ delivery_tax_invoice: data });
      if (check.length === 0) {
        invoice_number =
          `OT${dayjs(date).format("YYYYMMDD")}`.padEnd(15, "0") + num;
      }
    } while (check.length !== 0);
  } else {
    invoice_number =
      `OT${dayjs(date).format("YYYYMMDD")}`.padEnd(15, "0") + "1";
  }
  return invoice_number;
}
