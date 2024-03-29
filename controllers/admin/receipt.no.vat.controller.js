const bcrypt = require("bcrypt");
const dayjs = require("dayjs");
const Joi = require("joi");
const { google } = require("googleapis");
const { default: axios } = require("axios");
const req = require("express/lib/request.js");
const { Admins, validateAdmin } = require("../../models/admin/admin.models");
const { Invoice } = require("../../models/admin/invoice.models");
const { Quotation } = require("../../models/admin/quotation.models");
const { ReceiptNoVat } = require("../../models/admin/receipt.no.vat.models");
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

exports.ReceiptNoVat = async (req, res) => {
  try {
    const invoiceID = req.body.invoiceID || req.body;
    const signatureID = req.body.signatureID || req.body;

    const signatureData = await Signature.findOne({ _id: signatureID });
    const quotationData = await Invoice.findOne({ _id: invoiceID });

    const invoice = await invoiceNumber();
    const {
      _id,
      timestamps,
      net,
      sumVat,
      withholding,
      isVat,
      ...receiptDataFields
    } = quotationData.toObject();

    const total = quotationData.total;
    const ShippingCost = req.body.ShippingCost || 0;
    const percen_deducted = req.body.percen_deducted || 0;
    const total_Shippingincluded = (net + ShippingCost);
    const total_deducted = (total_Shippingincluded * percen_deducted) / 100;
    const totalVat_deducted = (total_Shippingincluded - total_deducted).toFixed(
      2
    );

    const savedReceiptData = await ReceiptNoVat.create({
      ...receiptDataFields,
      signature: [
        {
          name: signatureData.name,
          image_signature: signatureData.image_signature,
          position: signatureData.position,
        },
      ],
      net: net,
      ShippingCost: ShippingCost,
      Shippingincluded: total_Shippingincluded,
      percen_deducted: percen_deducted,
      total_deducted: total_deducted,
      total_end_deducted: totalVat_deducted,
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
      receipt: invoice,
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
      quotation,
      sumVat,
      withholding,
      remark,
      isVat,
      invoice,
      signatureID,
    } = req.body;
    let total = 0;
    const updatedProductDetail = product_detail.map((product) => {
      const price = product.product_price;
      const amount = product.product_amount;
      const product_total = (price * amount);
      total += +product_total; // ให้มี + หน้าตัวแปรเพื่อแปลงเป็นตัวเลข
      return {
        ...product,
        product_total,
      };
    });
    const net = discount ? total - discount : total;
    const Shippingincluded = (net + ShippingCost);
    const percen_deducted1 = req.body.percen_deducted || 0;
    const total_Shippingincluded = (net + ShippingCost);
    const total_deducted1 = (total_Shippingincluded * percen_deducted) / 100;
    const totalVat_deducted1 = (
      total_Shippingincluded - total_deducted1
    );

    const invoice1 = await invoiceNumber();
    let signatureData = {};
    if (signatureID) {
      signatureData = await Signature.findOne({ _id: signatureID });
    }

    const quotation1 = await new ReceiptNoVat({
      ...req.body,
      receipt: invoice1,
      customer_detail: {
        ...req.body.customer_detail,
      },
      signature: {
        name: signatureData.name,
        image_signature: signatureData.image_signature,
        position: signatureData.position,
      },
      net: net,
      percen_deducted: percen_deducted1,
      total_deducted: total_deducted1,
      total_end_deducted: totalVat_deducted1,
      ShippingCost: ShippingCost,
      Shippingincluded: Shippingincluded,
      product_detail: updatedProductDetail,

      total: total,
      remark: remark,
      bank: {
        name: req.body.bank.name,
        img: req.body.bank.img,
        status: req.body.bank.status,
        remark_2: req.body.bank.remark_2,
      },
      timestamps: dayjs(Date.now()).format(""),
    }).save();

    if (quotation1) {
      return res.status(200).send({
        status: true,
        message: "สร้างใบเสนอราคาสำเร็จ",
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
exports.getReceiptByREB = async (req, res) => {
  try {
    const id = req.params.id;
    const admin = await ReceiptNoVat.findOne({ receipt: id });
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
exports.getREBAllfilter = async (req, res) => {
  try {
    const reb = await ReceiptNoVat.find({}, { _id: 1, receipt: 1 });
    if (!reb || reb.length === 0) {
      return res
        .status(404)
        .send({ status: false, message: "ไม่พบข้อมูลใบสั่งซื้อ" });
    } else {
      return res
        .status(200)
        .send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: reb });
    }
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, message: "มีบางอย่างผิดพลาด" });
  }
};
exports.EditReceipt = async (req, res) => {
  try {
    const customer_number = req.params.id;

    const existingQuotation = await ReceiptNoVat.findOne({
      _id: customer_number,
    });
    if (!existingQuotation) {
      return res.status(404).send({
        message: "ไม่พบใบเสนอราคาที่ต้องการแก้ไข",
        status: false,
      });
    }

    const { product_detail, discount, percen_deducted } = req.body;

    let total = 0;
    const updatedProductDetail = product_detail.map((product) => {
      const price = parseFloat(product.product_price);
      const amount = parseInt(product.product_amount);
      const vat_price = parseFloat(product.vat_price) || 0;
      const product_total = (price * amount + vat_price);
      total += parseFloat(product_total);
      return {
        ...product,
        product_total,
      };
    });

    const discountValue = typeof discount === "number" ? discount : 0;
    const discount_percent = discountValue ? (discountValue / total) * 100 : 0;
    const net = discountValue ? total - discountValue : total;
    const total_deducted = net * (req.body.percen_deducted / 100);

    const updatedQuotation = await ReceiptNoVat.findOneAndUpdate(
      { _id: customer_number },
      {
        $set: {
          product_detail: updatedProductDetail,
          total: total,
          discount: discountValue,
          net: net,
          percen_deducted,
          total_deducted: total_deducted,
          total_end_deducted: (net + total_deducted),
          start_date: req.body.start_date,
          end_date: req.body.end_date,
          remark: req.body.remark,
          bank: req.body.bank
            ? {
                name: req.body.bank.name || "",
                img: req.body.bank.img || "",
                status: req.body.bank.status || "",
                remark_2: req.body.bank.remark_2 || "",
              }
            : {
                name: "",
                img: "",
                status: "",
                remark_2: "",
              },
          signature: req.body.signature
            ? [
                {
                  name: req.body.signature.name || "",
                  image_signature: req.body.signature.image_signature || "",
                  position: req.body.signature.position || "",
                },
              ]
            : [
                {
                  name: "",
                  image_signature: "",
                  position: "",
                },
              ],
        },
      },
      { new: true }
    );
    if (updatedQuotation) {
      return res.status(200).send({
        status: true,
        message: "แก้ไขข้อมูล รายละเอียดสินค้า สำเร็จ",
        data: updatedQuotation,
      });
    } else {
      return res.status(404).send({
        message: "ไม่พบใบเสนอราคาที่ต้องการแก้ไข",
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
  const order = await ReceiptNoVat.find();
  let invoice_number = null;
  if (order.length !== 0) {
    let data = "";
    let num = 0;
    let check = null;
    do {
      num = num + 1;
      data = `REB${dayjs(date).format("YYYYMMDD")}`.padEnd(15, "0") + num;
      check = await ReceiptNoVat.find({ receipt: data });
      if (check.length === 0) {
        invoice_number =
          `REB${dayjs(date).format("YYYYMMDD")}`.padEnd(15, "0") + num;
      }
    } while (check.length !== 0);
  } else {
    invoice_number =
      `REB${dayjs(date).format("YYYYMMDD")}`.padEnd(15, "0") + "1";
  }
  return invoice_number;
}
