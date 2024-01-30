const bcrypt = require("bcrypt");
const dayjs = require("dayjs");
const Joi = require("joi");
const { google } = require("googleapis");
const { default: axios } = require("axios");
const req = require("express/lib/request.js");
const { Admins, validateAdmin } = require("../../models/admin/admin.models");
const { Quotation } = require("../../models/admin/quotation.models");
const { Branch } = require("../../models/ฺฺbranch/ฺฺbranch.models");
const { Company } = require("../../models/company/company.models");
const { Signature } = require("../../models/signature/signature.models");
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
      ShippingCost = 0,
      discount = 0,
      start_date,
      end_date,
      signatureID,
      percen_deducted = 0,
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

    const percen_deducted1 = req.body.percen_deducted || 0;
    const discount_percent = discount ? (discount / total) * 100 : 0;
    const net = discount ? total - discount : total;
    const vatRate = 0.07;
    const vat = Number((net * vatRate).toFixed(2));
    const totalvat = Number((net + vat).toFixed(2));
    const total_deducted1 = (net * percen_deducted1) / 100;

    let customer = {};
    const branchId = req.body.branchId;
    const branch = branchId ? await Company.findById(branchId) : null;

    if (customer_number) {
      customer = await Customer.findOne({ customer_number });
    } else {
      customer = req.body.customer_detail || {};
    }
    let signatureData = {};
    if (signatureID) {
      signatureData = await Signature.findOne({ _id: signatureID });
    }

    const quotation1 = await QuotationNumber();
    const quotation = await new Quotation({
      ...req.body,
      quotation: quotation1, //เลขใบเสนอราคา
      customer_branch: branch
        ? {
            Branch_company_name: branch.Branch_company_name,
            Branch_company_number: branch.Branch_company_number,
            Branch_company_address: branch.Branch_company_address,
            Branch_tel: branch.Branch_tel,
            contact_name: branch.contact_name,
            contact_number: branch.contact_number,
            company_email: branch.company_email,
          }
        : null,

      customer_detail: {
        ...req.body.customer_detail,
        tax_id: customer.customer_taxnumber,
        customer_name: customer.customer_name,
        customer_lastname: customer.customer_lastname,
        customer_phone: customer.customer_phone,
        customer_email: customer.customer_email,
        customer_address: customer.customer_address,
        customer_type: customer.customer_type,
      },
      signature: {
        name: signatureData.name,
        image_signature: signatureData.image_signature,
        position: signatureData.position,
      },
      product_detail: updatedProductDetail,
      discount: discount.toFixed(2),
      discount_persen: discount_percent.toFixed(2),
      total: total.toFixed(2),
      net: net,
      vat: {
        percen_deducted: percen_deducted1,
        total_deducted: total_deducted1,
        totalVat_deducted: net - total_deducted1,
      },
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
    const {
      product_detail,
      customer_detail,
      customer_number,
      percen_deducted = 0,
      percen_payment = 0,
      discount = 0,
      ShippingCost = 0,
      signatureID,
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
    const vatAmount = net * vatRate;
    const totalWithVat = net + vatAmount;
    let customer = {};
    const branchId = req.body.branchId;
    const branch = branchId ? await Company.findById(branchId) : null;

    if (customer_number) {
      customer = await Customer.findOne({ customer_number });
    } else {
      customer = req.body.customer_detail || {};
    }
    let signatureData = {};
    if (signatureID) {
      signatureData = await Signature.findOne({ _id: signatureID });
    }

    const deductionPercentage = parseFloat(req.body.percen_deducted) || 0;
    const total_deducted1 = (
      (totalWithVat * deductionPercentage) /
      100
    ).toFixed(2);
    const totalVat_deducted1 = (totalWithVat - total_deducted1).toFixed(2);

    const amount_vat = ((total * vatRate) / 1.07).toFixed(2);
    const total_amount_product = (total - amount_vat).toFixed(2);
    const totalAll = total_amount_product - discount;
    const tatal_Shippingincluded = totalAll + ShippingCost;
    const total_paymeny = (
      (tatal_Shippingincluded * percen_payment) /
      100
    ).toFixed(2);

    const quotation1 = await QuotationNumber();
    const quotation = await new Quotation({
      ...req.body,
      quotation: quotation1, //เลขใยเสนอราคา
      customer_branch: branch
        ? {
            Branch_company_name: branch.Branch_company_name,
            Branch_company_number: branch.Branch_company_number,
            Branch_company_address: branch.Branch_company_address,
            Branch_tel: branch.Branch_tel,
            contact_name: branch.contact_name,
            contact_number: branch.contact_number,
            company_email: branch.company_email,
          }
        : null,
      signature: {
        name: signatureData.name,
        image_signature: signatureData.image_signature,
        position: signatureData.position,
      },
      customer_detail: {
        ...req.body.customer_detail,
        tax_id: customer.customer_taxnumber,
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
      vat: {
        amount_vat: vatAmount.toFixed(2),
        totalvat: totalWithVat.toFixed(2),
        ShippingCost: ShippingCost,
        // Shippingincluded: Shippingincluded,
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
        discount: req.body.discount,
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
exports.getQuotationByQT = async (req, res) => {
  try {
    const id = req.params.id;
    const quotation = await Quotation.findOne({ quotation: id });
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
exports.ImportImgProduct = async (req, res) => {
  try {
    let upload = multer({ storage: storage }).array("imgCollection", 20);
    upload(req, res, async function (err) {
      const reqFiles = [];
      const result = [];
      if (err) {
        return res.status(500).send(err);
      }
      if (req.files) {
        const url = req.protocol + "://" + req.get("host");
        for (var i = 0; i < req.files.length; i++) {
          const src = await uploadFileCreate(req.files, res, { i, reqFiles });
          result.push(src);
        }
      }
      const productId = req.params.id; // _id ที่อยู่ภายใน product_detail
      const quotationId = req.params.quotationId;
      if (req.files && req.files.length > 0) {
        const updatedQuotation = await Quotation.findOneAndUpdate(
          {
            _id: quotationId,
            "product_detail._id": productId,
          },
          {
            $set: {
              "product_detail.$[element].product_logo": reqFiles[0],
            },
          },
          {
            arrayFilters: [{ "element._id": productId }],
            new: true,
          }
        );

        if (updatedQuotation) {
          return res.status(200).send({
            message: "อัปเดตรูปภาพสำเร็จ",
            status: true,
          });
        } else {
          return res.status(500).send({
            message: "ไม่สามารถอัปเดตรูปภาพได้",
            status: false,
          });
        }
      } else {
        return res.status(400).send({
          message: "ไม่พบไฟล์ที่อัปโหลด",
          status: false,
        });
      }
    });
  } catch (error) {
    return res.status(500).send({ status: false, error: error.message });
  }
};
exports.getQTAllfilter = async (req, res) => {
  try {
    const quotations = await Quotation.find({}, { _id: 1, quotation: 1 });
    if (!quotations || quotations.length === 0) {
      return res
        .status(404)
        .send({ status: false, message: "ไม่พบข้อมูลใบเสนอราคา" });
    } else {
      return res
        .status(200)
        .send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: quotations });
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
