const bcrypt = require("bcrypt");
const dayjs = require("dayjs");
const Joi = require("joi");
const { google } = require("googleapis");
const { default: axios } = require("axios");
const req = require("express/lib/request.js");
const { Admins, validateAdmin } = require("../../models/admin/admin.models");
const { Quotation } = require("../../models/admin/quotation.models");
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

exports.QuotationVat = async (req, res) => {
  try {
    const {
      product_detail,
      customer_detail,
      customer_number,
      discount,
      start_date,
      end_date,
    } = req.body;
    let total = 0;
    const updatedProductDetail = product_detail.map((product) => {
      const price = parseFloat(product.product_price);
      const amount = parseInt(product.product_amount);
      const product_total = (price * amount).toFixed(2);
      total += parseFloat(product_total); // รวม product_total เข้า total
      return {
        ...product,
        product_total,
      };
    });
    const discount_percent = discount ? (discount / total) * 100 : 0;
    const net = discount ? total - discount : total;
    const vatRate = 0.07;
    const vat = Number((net * vatRate).toFixed(2));
    const totalvat = Number((net + vat).toFixed(2));
    let customer = {};
    if (customer_number) {
      customer = await Customer.findOne({ customer_number });
    } else {
      customer = req.body.customer_detail || {};
    }
    const quotation1 = await QuotationNumber();
    const quotation = await new Quotation({
      ...req.body,
      quotation: quotation1, //เลขใยเสนอราคา
      customer_detail: {
        ...req.body.customer_detail,
        customer_name: customer.customer_name,
        customer_lastname: customer.customer_lastname,
        customer_phone: customer.customer_phone,
        customer_email: customer.customer_email,
        customer_address: customer.customer_address,
        customer_type: customer.customer_type,
      },
      product_detail: updatedProductDetail,
      discount: discount.toFixed(2),
      discount_persen: discount_percent.toFixed(2),
      total: total.toFixed(2),
      vat: vat,
      net: net,
      totalvat: totalvat,
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
      message: "มีบางอย่างผิดพลาด222",
      status: false,
      error: error.message,
    });
  }
};
exports.Quotation = async (req, res) => {
  try {
    const { product_detail, customer_detail, customer_number, discount } =
      req.body;
    let total = 0;
    const updatedProductDetail = product_detail.map((product) => {
      const price = parseFloat(product.product_price);
      const amount = parseInt(product.product_amount);
      const product_total = (price * amount).toFixed(2);
      total += parseFloat(product_total); // รวม product_total เข้า total
      return {
        ...product,
        product_total,
      };
    });
    const discount_percent = discount ? (discount / total) * 100 : 0;
    const net = discount ? total - discount : total;
    let customer = {};
    if (customer_number) {
      customer = await Customer.findOne({ customer_number });
    } else {
      customer = req.body.customer_detail || {};
    }
    const quotation1 = await QuotationNumber();
    const quotation = await new Quotation({
      ...req.body,
      quotation: quotation1, //เลขใยเสนอราคา
      customer_detail: {
        ...req.body.customer_detail,
        customer_name: customer.customer_name,
        customer_lastname: customer.customer_lastname,
        customer_phone: customer.customer_phone,
        customer_email: customer.customer_email,
        customer_address: customer.customer_address,
        customer_type: customer.customer_type,
      },
      product_detail: updatedProductDetail,
      total: total.toFixed(2), // ให้ total มีทศนิยม 2 ตำแหน่ง
      discount: discount.toFixed(2),
      discount_persen: discount_percent.toFixed(2),
      net: net,
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
      message: "มีบางอย่างผิดพลาด222",
      status: false,
      error: error.message,
    });
  }
};
exports.EditQuotation = async (req, res) => {
  try {
    const { customer_number } = req.params;
    const { product_detail } = req.body;
    let total = 0;
    const updatedProductDetail = product_detail.map((product) => {
      const price = parseFloat(product.product_price);
      const amount = parseInt(product.product_amount);
      const product_total = (price * amount).toFixed(2);
      total += parseFloat(product_total); // รวม product_total เข้า total
      return {
        ...product,
        product_total,
      };
    });
    const updatedQuotation = await Quotation.findOneAndUpdate(
      { "customer_detail.customer_number": customer_number },
      {
        $set: { product_detail: updatedProductDetail, total: total.toFixed(2) },
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
exports.deleteQuotation = async (req, res) => {
  try {
    const id = req.params.id;
    const quotation = await Quotation.findByIdAndDelete(id);
    if (!quotation) {
      return res
        .status(404)
        .send({ status: false, message: "ไม่พบใบเสนอราคา" });
    } else {
      return res
        .status(200)
        .send({ status: true, message: "ลบข้อมูลใบเสนอราคาสำเร็จ" });
    }
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, message: "มีบางอย่างผิดพลาด" });
  }
};
exports.deleteAllQuotation = async (req, res) => {
  try {
    const result = await Quotation.deleteMany({});

    if (result.deletedCount > 0) {
      return res
        .status(200)
        .send({ status: true, message: "ลบข้อมูลใบเสนอราคาทั้งหมดสำเร็จ" });
    } else {
      return res
        .status(404)
        .send({ status: false, message: "ไม่พบใบเสนอราคาที่ต้องการลบ" });
    }
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, message: "มีบางอย่างผิดพลาด" });
  }
};
exports.getQuotationAll = async (req, res) => {
  try {
    const quotation = await Quotation.find();
    if (!quotation) {
      return res
        .status(404)
        .send({ status: false, message: "ไม่พบข้อมูลใบเสนอราคา" });
    } else {
      return res
        .status(200)
        .send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: quotation });
    }
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, message: "มีบางอย่างผิดพลาด" });
  }
};
exports.getQuotationById = async (req, res) => {
  try {
    const id = req.params.id;
    const quotation = await Quotation.findById(id);
    if (!quotation) {
      return res
        .status(404)
        .send({ status: false, message: "ไม่พบใบเสนอราคา" });
    } else {
      return res
        .status(200)
        .send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: quotation });
    }
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, message: "มีบางอย่างผิดพลาด" });
  }
};
//ค้นหาและสร้างเลข invoice
async function QuotationNumber(date) {
  const number = await Quotation.find();
  let quotation_number = null;
  if (number.length !== 0) {
    let data = "";
    let num = 0;
    let check = null;
    do {
      num = num + 1;
      data = `QT${dayjs(date).format("YYYYMMDD")}`.padEnd(15, "0") + num;
      check = await Quotation.find({ quotation: data });
      if (check.length === 0) {
        quotation_number =
          `QT${dayjs(date).format("YYYYMMDD")}`.padEnd(15, "0") + num;
      }
    } while (check.length !== 0);
  } else {
    quotation_number =
      `QT${dayjs(date).format("YYYYMMDD")}`.padEnd(15, "0") + "1";
  }
  return quotation_number;
}
