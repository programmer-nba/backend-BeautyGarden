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
const { admin } = require("googleapis/build/src/apis/admin");

exports.ReceiptVat = async (req, res) => {
  try {
    const invoiceID = req.body.invoiceID || req.body;
    const signatureID = req.body.signatureID || req.body;

    const signatureData = await Signature.findOne({ _id: signatureID });
    const quotationData = await Invoice.findOne({ _id: invoiceID });

    const invoice = await invoiceNumber();
    const {
      _id,
      timestamps,
      vat,
      discount,
      sumVat,
      withholding,
      isVat,
      ...receiptDataFields
    } = quotationData.toObject();

    const total = quotationData.total;
    const ShippingCost = req.body.ShippingCost || 0;
    const percen_deducted = req.body.percen_deducted || 0;
    const percen_payment = req.body.percen_payment || 0;
    const net = discount ? total - discount : total;
    const vatPercentage = 0.07; // VAT rate (7%)

    const vatAmount = net * vatPercentage;
    const totalExcludingVAT = net - vatAmount;
    const totalvat = (vatAmount + net).toFixed(2);
    const Shippingincluded = (
      parseFloat(totalvat) + parseFloat(ShippingCost)
    ).toFixed(2);

    const deductionPercentage = parseFloat(req.body.percen_deducted) || 0;
    const total_deducted = ((totalvat * deductionPercentage) / 100).toFixed(2);
    const totalVat_deducted = (Shippingincluded - total_deducted).toFixed(2);

    const amount_vat = ((total * vatPercentage) / 1.07).toFixed(2);
    const total_amount_product = (total - amount_vat).toFixed(2);
    const totalAll = total_amount_product - discount;
    const tatal_Shippingincluded = totalAll + ShippingCost;
    const total_paymeny = (
      (tatal_Shippingincluded * percen_payment) /
      100
    ).toFixed(2);

    const savedReceiptData = await ReceiptVat.create({
      ...receiptDataFields,
      receipt: invoice,
      signature: {
        name: signatureData.name,
        image_signature: signatureData.image_signature,
        position: signatureData.position,
      },
      quotation: quotationData.quotation,
      invoice: quotationData.invoice,
      discount: discount.toFixed(2),
      net: net.toFixed(2),
      vat: {
        amount_vat: vatAmount.toFixed(2),
        totalvat: (vatAmount + net).toFixed(2),
        percen_deducted: deductionPercentage.toFixed(2),
        total_deducted: total_deducted,
        totalVat_deducted: totalVat_deducted,
        ShippingCost: ShippingCost,
        Shippingincluded: Shippingincluded,
      },
      total_products: {
        amount_vat: amount_vat,
        total_product: total_amount_product,
        percen_payment: percen_payment,
        total_discount: totalAll,
        ShippingCost1: ShippingCost,
        total_ShippingCost1: tatal_Shippingincluded,
        after_discoun_payment: total_paymeny,
        total_all_end: total - total_paymeny - discount,
      },
      start_date: req.body.start_date,
      end_date: req.body.end_date,
      note: req.body.note,
      remark: req.body.remark,
      bank: {
        name: req.body.bank.name,
        img: req.body.bank.img,
        status: req.body.bank.status,
        remark_2: req.body.bank.remark_2,
      },
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
    const {
      product_detail,
      ShippingCost = 0,
      note,
      discount = 0,
      percen_deducted = 0,
      total_deducted = 0,
      totalVat_deducted = 0,
      start_date,
      end_date,
      signatureID,
      remark,
      sumVat,
      withholding,
      isVat,
      quotation,
      percen_payment = 0,
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
    let signatureData = {};
    if (signatureID) {
      signatureData = await Signature.findOne({ _id: signatureID });
    }
    const deductionPercentage = parseFloat(req.body.percen_deducted) || 0;
    const total_deducted1 = (
      (Shippingincluded * deductionPercentage) /
      100
    ).toFixed(2);
    const totalVat_deducted1 = (Shippingincluded - total_deducted1).toFixed(2);

    const amount_vat = ((total * vatRate) / 1.07).toFixed(2);
    const total_amount_product = (total - amount_vat).toFixed(2);
    const totalAll = total_amount_product - discount;
    const tatal_Shippingincluded = totalAll + ShippingCost;
    const total_paymeny = (
      (tatal_Shippingincluded * percen_payment) /
      100
    ).toFixed(2);

    const quotation1 = await new ReceiptVat({
      ...req.body,
      customer_detail: {
        ...req.body.customer_detail,
      },
      signature: {
        name: signatureData.name,
        image_signature: signatureData.image_signature,
        position: signatureData.position,
      },
      receipt: invoice1,
      discount: discount.toFixed(2),
      net: net,
      product_detail: updatedProductDetail,
      total: total.toFixed(2),
      vat: {
        amount_vat: vatAmount,
        totalvat: totalWithVat.toFixed(2),
        ShippingCost: ShippingCost,
        Shippingincluded: Shippingincluded,
        percen_deducted: percen_deducted,
        total_deducted: total_deducted1,
        totalVat_deducted: totalVat_deducted1,
      },
      total_products: {
        amount_vat: amount_vat,
        total_product: total_amount_product,
        percen_payment: percen_payment,
        total_discount: totalAll,
        ShippingCost1: ShippingCost,
        total_ShippingCost1: tatal_Shippingincluded,
        after_discoun_payment: total_paymeny,
        total_all_end: total - total_paymeny - discount,
      },
      remark: remark,
      bank: {
        name: req.body.bank.name,
        img: req.body.bank.img,
        status: req.body.bank.status,
        remark_2: req.body.bank.remark_2,
      },
      sumVat: sumVat,
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
exports.getReceiptVatByREP = async (req, res) => {
  try {
    const id = req.params.id;
    const admin = await ReceiptVat.findOne({ receipt: id });
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
exports.getREPAllfilter = async (req, res) => {
  try {
    const rep = await ReceiptVat.find({}, { _id: 1, receipt: 1 });
    if (!rep || rep.length === 0) {
      return res
        .status(404)
        .send({ status: false, message: "ไม่พบข้อมูลใบสั่งซื้อ" });
    } else {
      return res
        .status(200)
        .send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: rep });
    }
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, message: "มีบางอย่างผิดพลาด" });
  }
};
exports.EditReceiptVat = async (req, res) => {
  try {
    const customer_number = req.params.id;
    const { product_detail, discount, bank } = req.body;

    let total = 0;
    const updatedProductDetail = product_detail.map((product) => {
      const price = parseFloat(product.product_price);
      const amount = parseInt(product.product_amount);
      const product_total = (price * amount).toFixed(2);
      total += parseFloat(product_total);
      return {
        ...product,
        product_total,
      };
    });

    const discountValue = typeof discount === "number" ? discount : 0;
    const discount_percent = discountValue ? (discountValue / total) * 100 : 0;
    const net = discountValue ? total - discountValue : total;
    const vatRate = 0.07;
    const vatAmount = net * vatRate;
    const totalWithVat = net + vatAmount;

    const deductionPercentage = parseFloat(req.body.percen_deducted) || 0;
    const total_deducted1 = (
      (totalWithVat * deductionPercentage) /
      100
    ).toFixed(2);
    const totalVat_deducted1 = (totalWithVat - total_deducted1).toFixed(2);

    const amount_vat = ((total * vatRate) / 1.07).toFixed(2);
    const total_amount_product = (total - amount_vat).toFixed(2);
    const totalAll = total_amount_product - discountValue;

    const total_payment = ((totalAll * req.body.percen_payment) / 100).toFixed(
      2
    );

    const total_all_end = (total - total_payment - discountValue).toFixed(2);

    const updatedReceiptVat = await ReceiptVat.findOneAndUpdate(
      { _id: customer_number },
      {
        $set: {
          product_detail: updatedProductDetail,
          total: total.toFixed(2),
          discount: discountValue.toFixed(2),
          discount_persen: discount_percent.toFixed(2),
          net,
          "vat.amount_vat": vatAmount.toFixed(2),
          "vat.totalvat": totalWithVat.toFixed(2),
          "vat.ShippingCost": req.body.ShippingCost,
          "vat.percen_deducted": req.body.percen_deducted,
          "vat.total_deducted": total_deducted1,
          "vat.totalVat_deducted": totalVat_deducted1,
          "total_products.amount_vat": amount_vat,
          "total_products.total_product": total_amount_product,
          "total_products.total_discount": totalAll,
          "total_products.percen_payment": req.body.percen_payment,
          "total_products.after_discoun_payment": total_payment,
          "total_products.total_all_end": total_all_end,
          start_date: req.body.start_date,
          end_date: req.body.end_date,
          remark: req.body.remark,
          bank: {
            name: req.body.bank.name,
            img: req.body.bank.img,
            status: req.body.bank.status,
            remark_2: req.body.bank.remark_2,
          },
          signature: {
            name: req.body.signature.name,
            image_signature: req.body.signature.image_signature,
            position: req.body.signature.position,
          },
        },
      },
      { new: true }
    );

    if (updatedReceiptVat) {
      return res.status(200).send({
        status: true,
        message: "แก้ไขข้อมูล รายละเอียดสินค้า สำเร็จ",
        data: updatedReceiptVat,
      });
    } else {
      return res.status(404).send({
        message: "ไม่พบใบเสร็จที่ต้องการแก้ไข",
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

async function invoiceNumber(date) {
  const order = await ReceiptVat.find();
  let invoice_number = null;
  if (order.length !== 0) {
    let data = "";
    let num = 0;
    let check = null;
    do {
      num = num + 1;
      data = `REP${dayjs(date).format("YYYYMMDD")}`.padEnd(15, "0") + num;
      check = await ReceiptVat.find({ receipt: data });
      if (check.length === 0) {
        invoice_number =
          `REP${dayjs(date).format("YYYYMMDD")}`.padEnd(15, "0") + num;
      }
    } while (check.length !== 0);
  } else {
    invoice_number =
      `REP${dayjs(date).format("YYYYMMDD")}`.padEnd(15, "0") + "1";
  }
  return invoice_number;
}
