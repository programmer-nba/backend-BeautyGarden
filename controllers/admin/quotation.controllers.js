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


function formatDate(date) {
  var year = date.getFullYear()
  var month = ('0' + (date.getMonth() + 1)).slice(-2)
  var day = ('0' + date.getDate()).slice(-2)
  return year + month + day
}

function formatDocLength(docLength) {
  const length = 
    docLength < 10 ? `00000${docLength}`
    : docLength > 10 && docLength < 100 ? `0000${docLength}`
    : docLength > 100 && docLength < 1000 ? `000${docLength}`
    : docLength > 1000 && docLength < 10000 ? `00${docLength}`
    : docLength > 10000 && docLength < 100000 ? `0${docLength}`
    : `${docLength}`
  return length
}

async function QuotationNumber() {
  const date = new Date()
  const formattedDate = formatDate(date)
  const document = await Quotation.find()
  const lastQuotation = document[document.length-1].quotation
  //const documentLength = document.length+1
  //const formattedDocLength = formatDocLength(documentLength)
  //const result = `QT${formattedDate}${formattedDocLength}`
  const result = incrementNumericPart(lastQuotation)
  return result
}

function incrementNumericPart(inputString) {
  const numericPart = inputString.match(/\d+$/)[0]; // Extract the numeric part using regex
  const incrementedNumericPart = String(Number(numericPart) + 1).padStart(numericPart.length, '0'); // Increment and pad with leading zeros
  return inputString.replace(/\d+$/, incrementedNumericPart); // Replace the numeric part with the incremented value
}

exports.QuotationVat = async (req, res) => {
  try {
    const {
      product_detail,
      product_head,
      customer_detail,
      customer_number,
      ShippingCost = 0,
      discount = 0,
      transfer,
      sumVat,
      start_date,
      end_date,
      status,
      remark,
      signatureID,
      percen_deducted = 0,
    } = req.body;
    let total = 0;
    const updatedProductDetail = product_detail.map((product) => {
      const price = parseFloat(product.product_price);
      const amount = parseInt(product.product_amount);
      const product_total = price * amount;
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
    const vat = Number((net * vatRate));
    const totalvat = Number((net + vat));
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
            Branch_iden_number: branch.Branch_iden_number,
            Branch_tel: branch.Branch_tel,
            contact_name: branch.contact_name,
            taxnumber: branch.taxnumber,
            isVat: branch.isVat,
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
      product_head: product_head,
      product_detail: updatedProductDetail,
      discount: discount,
      discount_persen: discount_percent,
      total: total,
      net: net,
      vat: {
        percen_deducted: percen_deducted1,
        total_deducted: total_deducted1,
        totalVat_deducted: net - total_deducted1,
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
      transfer: transfer,
      status: status
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
      status,
      project,
      percen_deducted = 0,
      percen_payment = 0,
      discount = 0,
      ShippingCost = 0,
      remark,
      signatureID,
      transfer,
      isSign
    } = req.body;
    let total = 0;

    const updatedProductDetail = product_detail.map((product) => {
      const price = parseFloat(product.product_price);
      const amount = parseInt(product.product_amount);
      const vat_price = parseFloat(product.vat_price) || 0;
      const product_total = (price * amount) + vat_price;
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
    let signatureData = [];
    if (signatureID && signatureID.length > 0) {
      signatureData = await Signature.find({ _id: { $in: signatureID } });
    }

    const deductionPercentage = parseFloat(req.body.percen_deducted) || 0;
    const total_deducted1 = (totalWithVat * deductionPercentage) / 100;
    const totalVat_deducted1 = totalWithVat - total_deducted1;

    const amount_vat = (total * vatRate) / 1.07;
    const total_amount_product = total - amount_vat;
    const totalAll = total_amount_product - discount;
    const tatal_Shippingincluded = totalAll + ShippingCost;
    const total_paymeny = (tatal_Shippingincluded * percen_payment) / 100;

    const quotation1 = await QuotationNumber();
    const quotation = await new Quotation({
      ...req.body,
      project: project,
      quotation: quotation1, //เลขใยเสนอราคา
      customer_branch: branch
        ? {
            Branch_company_name: branch.Branch_company_name,
            Branch_company_number: branch.Branch_company_number,
            Branch_company_address: branch.Branch_company_address,
            taxnumber: branch.taxnumber,
            Branch_iden_number: branch.Branch_iden_number,
            isVat: branch.isVat,
            Branch_tel: branch.Branch_tel,
            contact_name: branch.contact_name,
            contact_number: branch.contact_number,
            company_email: branch.company_email,
          }
        : null,
      signature: signatureData,
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
      isSign: isSign,
      product_detail: updatedProductDetail,
      total: total, // ให้ total มีทศนิยม 2 ตำแหน่ง
      discount: discount,
      discount_persen: discount_percent,
      net: net,
      vat: {
        amount_vat: vatAmount,
        totalvat: totalWithVat,
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
      remark: remark,
      bank: {
        name: req.body.bank.name,
        img: req.body.bank.img,
        status: req.body.bank.status,
        remark_2: req.body.bank.remark_2,
      },
      timestamps: dayjs(Date.now()).format(""),
      transfer: transfer,
      status: status
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

exports.uploadPictureQuotation = async (req, res) => {
  const { qtId, productId } = req.params
  const { pic } = req.body
  try {
    let quotation = await Quotation.findById(qtId)
    if (!quotation) {
      return res.send({
        message: 'not found',
        status: false,
        data: null
      })
    }
    let productIndex = quotation.product_detail.findIndex(prod=>prod._id === productId)
    if (productIndex === -1) {
      return res.send({
        message: 'not found',
        status: false,
        data: null
      })
    }

    quotation.product_detail[productIndex].product_logo.push(pic)
    
    await quotation.save()

    return res.send({
      message: 'upload success!',
      status: true,
      data: quotation
    })

  }
  catch (err) {
    console.log(err)
    return res.send({
      message: err.message,
      status: false,
      data: null
    })
  }
}

exports.EditQuotation = async (req, res) => {
  try {
    const customer_number = req.params.id;

    const { product_detail, discount, project, signatureID, product_head, isSign, customer_detail } = req.body;

    let total = 0;
    const updatedProductDetail = product_detail.map((product) => {
      const price = parseFloat(product.product_price);
      const amount = parseInt(product.product_amount);
      const vat_price = parseFloat(product.vat_price) || 0;
      const product_total = price * amount + vat_price;
      total += parseFloat(product_total);
      return {
        ...product,
        product_total,
      };
    });
    let signatureData = [];
    if (signatureID && signatureID.length > 0) {
      signatureData = await Signature.find({ _id: { $in: signatureID } });
    }

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
    );
    const totalVat_deducted1 = (totalWithVat - total_deducted1);

    const amount_vat = ((total * vatRate) / 1.07);
    const total_amount_product = (total - amount_vat);
    const totalAll = total_amount_product - discountValue;

    const total_payment = ((totalAll * req.body.percen_payment) / 100).toFixed(
      2
    );

    const total_all_end = (total - total_payment - discountValue) || 0;

    const branchId = req.body.branchId;
    const branch = branchId ? await Company.findById(branchId) : null;

    const updatedQuotation = await Quotation.findOneAndUpdate(
      { _id: customer_number },
      {
        $set: {
          customer_branch: branch
        ? {
            Branch_company_name: branch.Branch_company_name,
            Branch_company_number: branch.Branch_company_number,
            Branch_company_address: branch.Branch_company_address,
            taxnumber: branch.taxnumber,
            Branch_iden_number: branch.Branch_iden_number,
            isVat: branch.isVat,
            Branch_tel: branch.Branch_tel,
            contact_name: branch.contact_name,
            contact_number: branch.contact_number,
            company_email: branch.company_email,
          }
        : null,
          product_head: product_head,
          product_detail: updatedProductDetail,
          total: total,
          project: project,
          discount: discountValue,
          discount_persen: discount_percent,
          net,
          "vat.amount_vat": vatAmount,
          "vat.totalvat": totalWithVat,
          "vat.ShippingCost": req.body.ShippingCost,
          "vat.percen_deducted": req.body.percen_deducted,
          "vat.total_deducted": total_deducted1,
          "vat.totalVat_deducted": totalVat_deducted1,
          "total_products.amount_vat": amount_vat,
          "total_products.total_product": total_amount_product,
          "total_products.total_discount": totalAll,
          "total_products.percen_payment": req.body.percen_payment,
          //"total_products.after_discoun_payment": total_payment || 0,
          "total_products.total_all_end": total_all_end || 0,
          start_date: req.body.start_date,
          end_date: req.body.end_date,
          "customer_detail.customer_name": customer_detail.customer_name || "-",
          "customer_detail.customer_address": customer_detail.customer_address || "-",
          "customer_detail.customer_email": customer_detail.customer_email || null,
          "customer_detail.customer_lastname": customer_detail.customer_lastname || null,
          "customer_detail.customer_phone": customer_detail.customer_phone || null,
          "customer_detail.customer_type": customer_detail.customer_type || "Normal",
          "customer_detail.tax_id": customer_detail.tax_id || null,
          remark: req.body.remark,
          isSign: isSign,
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
          signature: signatureData,
          sumVat: req.body.sumVat
        },
      },
      { new: true }
    );

    if (updatedQuotation) {
      return res.status(200).send({
        status: true,
        message: "แก้ไขข้อมูล รายละเอียดสินค้า สำเร็จ",
        data: updatedQuotation,
        customer: customer_detail
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
      console.log('result',result)
      const productId = req.params.id; // _id ที่อยู่ภายใน product_detail
      const quotationId = req.params.quotationId;

      if (req.files && req.files.length > 0) {
        const updatedQuotation = await Quotation.findOneAndUpdate(
          {
            _id: quotationId,
            "product_detail._id": productId,
          },
          {
            $push: { "product_detail.$.product_logo": { $each: result } },
          },
          {
            new:true
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




