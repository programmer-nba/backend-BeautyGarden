const bcrypt = require("bcrypt");
const dayjs = require("dayjs");
const Joi = require("joi");
const { google } = require("googleapis");
const { default: axios } = require("axios");
const req = require("express/lib/request.js");
const { Admins, validateAdmin } = require("../../models/admin/admin.models");
const { Invoice } = require("../../models/admin/invoice.models");
const { Quotation } = require("../../models/admin/quotation.models");
const { Signature } = require("../../models/signature/signature.models");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const { ReceiptVat } = require("../../models/admin/receipt.vat.models");
const ChildInvoice = require("../../models/admin/childInvoice.model")
const { Company } = require("../../models/company/company.models");
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

async function invoiceNumber() {
  const date = new Date()
  const formattedDate = formatDate(date)
  const document = await Invoice.find()
  const documentLength = document.length
  const formattedDocLength = formatDocLength(documentLength)
  const result = `IV${formattedDate}${formattedDocLength}`
  
  return result
}

exports.ReceiptInvoiceVat = async (req, res) => {
  try {
    const quotationID = req.body.quotationID || req.body;
    const signatureID = req.body.signatureID || req.body;

    const signatureData = await Signature.findOne({ _id: signatureID });
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
    const totalvat = (vatAmount + net);
    const Shippingincluded = (
      parseFloat(totalvat) + parseFloat(ShippingCost)
    );

    const deductionPercentage = parseFloat(req.body.percen_deducted) || 0;
    const total_deducted = ((totalvat * deductionPercentage) / 100);
    const totalVat_deducted = (Shippingincluded - total_deducted);

    const savedReceiptData = await Invoice.create({
      ...receiptDataFields,
      signature: [
        {
          name: signatureData.name,
          image_signature: signatureData.image_signature,
          position: signatureData.position,
        },
      ],
      invoice: invoice,
      quotation: quotationData.quotation,
      discount: discount,
      net: net,
      vat: {
        amount_vat: vatAmount,
        totalvat: (vatAmount + net),
        percen_deducted: deductionPercentage,
        total_deducted: total_deducted,
        totalVat_deducted: totalVat_deducted,
      },
      start_date: req.body.start_date,
      end_date: req.body.end_date,
      remark: req.body.remark,
      bank: {
        name: req.body.bank.name,
        img: req.body.bank.img,
        status: req.body.bank.status,
        remark_2: req.body.bank.remark_2,
      },
      sumVat: req.body.sumVat,
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
      product_head,
      product_detail,
      ShippingCost = 0,
      transfer,
      discount = 0,
      project,
      percen_deducted = 0,
      start_date,
      header,
      end_date,
      quotation,
      sumVat,
      signatureID,
      percen_payment = 0,
      invoice,
      credit,
      end_period,
      cur_period,
      isSign,
      footer1,
      footer2
    } = req.body;

    const branchId = req.body.branchId;
    const branch = branchId ? await Company.findById(branchId) : null;

    let total = 0;
    const updatedProductDetail = product_detail.map((product) => {
      const price = product.product_price;
      const amount = product.product_amount;
      const vat_price = parseFloat(product.vat_price) || 0;
      const product_total = (price * amount);
      total += product_total+(amount*vat_price);
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
    let signatureData = [];
    if (signatureID && signatureID.length > 0) {
      signatureData = await Signature.find({ _id: { $in: signatureID } });
    }
    const Shippingincluded = (totalWithVat + ShippingCost);

    const deductionPercentage = parseFloat(req.body.percen_deducted) || 0;
    const total_deducted1 = (
      (Shippingincluded * deductionPercentage) /
      100
    );
    const totalVat_deducted1 = (Shippingincluded - total_deducted1);

    const amount_vat = ((total * vatRate) / 1.07);
    const total_amount_product = (total - amount_vat);
    const totalAll = total_amount_product - discount;
    const tatal_Shippingincluded = totalAll + ShippingCost;
    const total_paymeny = (
      (tatal_Shippingincluded * percen_payment) /
      100
    );
    const quotation1 = await new Invoice({
      ...req.body,
      customer_detail: {
        ...req.body.customer_detail,
      },
      header: header,
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
      transfer: transfer,
      project: project,
      signature: signatureData,
      invoice: invoice1,
      discount: discount,
      net: net,
      product_head: product_head,
      product_detail: updatedProductDetail,
      total: total,
      vat: {
        amount_vat: vatAmount,
        totalvat: totalWithVat,
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
        total_all_end: 0,
      },
      remark: req.body.remark,
      bank: {
        name: req.body.bank.name,
        img: req.body.bank.img,
        status: req.body.bank.status,
        remark_2: req.body.bank.remark_2,
      },
      sumVat: sumVat,
      credit: credit,
      timestamps: dayjs(Date.now()).format(""),
      end_period: end_period || 1,
      cur_period: cur_period || 0,
      start_date: start_date,
      end_date: end_date,
      quotation: quotation,
      status: [],
      paid: 0,
      isSign: isSign,
      footer1: footer1,
      footer2: footer2
    }).save();

    if (quotation) {
      const quotation_to_update = await Quotation.findOneAndUpdate(
        {
          quotation: quotation
        }, 
        { 
          $set: {
            status : 'invoiced' 
          }
        }, { new : true })

        if (!quotation_to_update) {
          return res.status(404).send({
            status: false,
            message: "ไม่พบใบเสนอราคาที่อ้างอิง",
            data: null,
          });
        }
    }

    if (quotation1) {
      return res.status(200).send({
        status: true,
        message: "สร้างใบแจ้งหนี้สำเร็จ",
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
      if (receipt.quotation) {
        const quotation_to_update = await Quotation.findOneAndUpdate(
          {
            quotation: receipt.quotation
          }, 
          { 
            $set: {
              status : null 
            }
          }, { new : true })
  
          if (!quotation_to_update) {
            return res.status(404).send({
              status: false,
              message: "ไม่พบใบเสนอราคาที่อ้างอิง",
              data: null,
            });
          }
      }
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
    let invoices = await Invoice.find();
    const receipts = await ReceiptVat.find();
    const childs = await ChildInvoice.find();

    const formattedInvoices = invoices.map(async invoice => {
      const receiptRefs = receipts.filter(rec => rec.invoice === invoice.invoice)
      const childRefs = childs.filter(cr => cr.refInvoice === invoice._id)
      if (!receiptRefs.length) return
      const amount_prices = receiptRefs.map(rep => rep.amount_price || 0)
      const invoice_periods = childRefs.map(inp => {
        const result = {
          child_id: inp._id,
          period: inp.period,
          start_date: inp.start_date,
          end_date: inp.end_date,
          price: inp.price
        }
        return result
      })
      const formatReceiptRefs = receiptRefs.map((ref,index) => {
        const result = {
          name: `${index + 1}/${invoice.end_period}`,
          receipt_id: ref._id,
          paid: ref.amount_price,
          period: index + 1,
          receipt: ref.receipt,
          receiptVat: ref.receiptVat,
          receiptNoVat: ref.receiptNoVat,
          isBillVat: ref.isBillVat,
          createdAt: ref.createdAt
        }
        return result
      })
      //invoice.status = [...formatReceiptRefs]
      invoice.invoice_period = [...invoice_periods]
      invoice.cur_period = receiptRefs.length
      invoice.paid = amount_prices.reduce((a,b) => a+b,0)

      await invoice.save()
    })
    
    const updated_invoices = await Promise.all(formattedInvoices)
    if( !updated_invoices ) {
      return res.status(500).send({
        message: "ไม่สามารถอัพเดทสถานะใบแจ้งหนี้",
        status: false,
      })
    }
    
    return res
      .status(200)
      .send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: invoices });
    
  } catch (err) {
    console.log(err)
    return res
      .status(500)
      .send({ status: false, message: err });
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
exports.EditInvoice = async (req, res) => {
  try {
    const customer_number = req.params.id;
    const {
      product_head,
      isSign,
      product_detail,
      ShippingCost = 0,
      discount = 0,
      percen_deducted = 0,
      start_date,
      end_date,
      quotation,
      project,
      sumVat,
      signatureID,
      percen_payment = 0,
      invoice,
      credit,
      header,
      end_period,
      cur_period,
      bank,
      remark,
      branchId,
      customer_detail,
      footer1,
      footer2
    } = req.body;

    const branch = branchId ? await Company.findById(branchId) : null;

    let total = 0;
    const updatedProductDetail = product_detail.map((product) => {
      const price = product.product_price;
      const amount = product.product_amount;
      const vat_price = parseFloat(product.vat_price) || 0;
      const product_total = (price * amount + vat_price);
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
    let signatureData = [];
    if (signatureID && signatureID.length > 0) {
      signatureData = await Signature.find({ _id: { $in: signatureID } });
    }
    const Shippingincluded = (totalWithVat + ShippingCost);

    const deductionPercentage = parseFloat(req.body.percen_deducted) || 0;
    const total_deducted1 = (
      (Shippingincluded * deductionPercentage) /
      100
    );
    const totalVat_deducted1 = (Shippingincluded - total_deducted1);

    const amount_vat = ((total * vatRate) / 1.07);
    const total_amount_product = (total - amount_vat);
    const totalAll = total_amount_product - discount;
    const tatal_Shippingincluded = totalAll + ShippingCost;
    const total_paymeny = (
      (tatal_Shippingincluded * percen_payment) /
      100
    );

    const updatedReceiptVat = await Invoice.findOneAndUpdate(
      { _id: customer_number },
      {
        $set: {
          product_head: product_head,
          product_detail: updatedProductDetail,
          total: total,
          discount: discount,
          net,
          "vat.amount_vat": vatAmount,
          "vat.totalvat": totalWithVat,
          "vat.ShippingCost": ShippingCost,
          "vat.percen_deducted": percen_deducted,
          "vat.total_deducted": total_deducted1,
          "vat.totalVat_deducted": totalVat_deducted1,
          "total_products.amount_vat": amount_vat,
          "total_products.total_product": total_amount_product,
          "total_products.total_discount": totalAll,
          "total_products.percen_payment": percen_payment,
          "total_products.after_discoun_payment": 0,
          "total_products.total_all_end": 0,
          start_date: start_date,
          end_date: end_date,
          remark: remark,
          header: header,
          project: project,
          customer_detail: customer_detail,
          bank: bank
            ? {
                name: bank.name || "",
                img: bank.img || "",
                status: bank.status || "",
                remark_2: bank.remark_2 || "",
              }
            : {
                name: "",
                img: "",
                status: "",
                remark_2: "",
              },
          signature: signatureData,
          credit: credit,
          end_period: end_period,
          cur_period: cur_period,
          quotation: quotation,
          sumVat: sumVat,
          footer1: footer1,
          footer2: footer2,
          isSign: isSign,
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
        }
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
        message: "ไม่พบใบเอกสารที่ต้องการแก้ไข",
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

exports.createNextInvoice = async (req, res) => {
  try {
    const { id } = req.params
    const { start_date, end_date, period } = req.body

    let invoice = await Invoice.findById( id )
    if (!invoice) {
      return res.send({
        message: 'ไม่พบใบแจ้งหนี้',
        status: false,
        data: null
      })
    }

    const invoice_period = {
      period: period,
      start_date: start_date || new Date(),
      end_date: end_date || start_date || new Date()
    }

    if (!invoice.invoice_period) {
      invoice.invoice_period = [invoice_period]
    } else {
      invoice.invoice_period = [...invoice.invoice_period, invoice_period]
    }

    const saved_invoice = await invoice.save()
    if (!saved_invoice) {
      return res.send({
        message: 'ไม่สามารถบันทึกใบแจ้งหนี้',
        status: false,
        data: null
      })
    }

    return res.send({
      message: 'บันทึกใบแจ้งหนี้สำเร็จ',
      status: true,
      data: saved_invoice
    })
    
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      message: "มีบางอย่างผิดพลาด",
      status: false,
      error: error.message,
    });
  }
};
