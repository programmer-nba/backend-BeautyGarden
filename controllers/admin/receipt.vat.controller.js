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
const { Company } = require("../../models/company/company.models");
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
const { response } = require("express");

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
    const totalvat = (vatAmount + net);
    const Shippingincluded = (
      parseFloat(totalvat) + parseFloat(ShippingCost)
    );

    const deductionPercentage = parseFloat(req.body.percen_deducted) || 0;
    const total_deducted = ((totalvat * deductionPercentage) / 100);
    const totalVat_deducted = (Shippingincluded - total_deducted);

    const amount_vat = ((total * vatPercentage) / 1.07);
    const total_amount_product = (total - amount_vat);
    const totalAll = total_amount_product - discount;
    const tatal_Shippingincluded = totalAll + ShippingCost;
    const total_paymeny = (
      (tatal_Shippingincluded * percen_payment) /
      100
    );

    const savedReceiptData = await ReceiptVat.create({
      ...receiptDataFields,
      receipt: invoice,
      signature: [
        {
          name: signatureData.name,
          image_signature: signatureData.image_signature,
          position: signatureData.position,
        },
      ],
      quotation: quotationData.quotation,
      invoice: quotationData.invoice,
      discount: discount,
      net: net,
      vat: {
        amount_vat: vatAmount,
        totalvat: (vatAmount + net),
        percen_deducted: deductionPercentage,
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
      product_head,
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
      branchId,
      percen_payment = 0,
      invoice,
      transfer,
      customer_detail,
      isSign
    } = req.body;

    let total = 0;
    const updatedProductDetail = product_detail.map((product) => {
      const price = product.product_price;
      const amount = product.product_amount;
      const vat_price = parseFloat(product.vat_price) || 0;
      const product_total = price * amount + vat_price;
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
    console.log(branchId)
    const customer_branch = await Company.findById(branchId)
    console.log(customer_branch)

    const invoice1 = await invoiceNumber();
    const Shippingincluded = totalWithVat + ShippingCost;
    let signatureData = [];
    if (signatureID && signatureID.length > 0) {
      signatureData = await Signature.find({ _id: { $in: signatureID } });
    }
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

    const quotation1 = await new ReceiptVat({
      ...req.body,
      customer_branch: customer_branch,
      customer_detail: customer_detail,
      signature: signatureData,
      receipt: invoice1,
      discount: discount,
      net: net,
      product_head: product_head,
      product_detail: updatedProductDetail,
      total: total,
      isSign: isSign,
      vat: {
        amount_vat: vatAmount,
        totalvat: totalWithVat,
        ShippingCost: ShippingCost,
        Shippingincluded: Shippingincluded,
        percen_deducted: percen_deducted,
        total_deducted: total_deducted1,
        totalVat_deducted: totalVat_deducted1,
      },
      transfer: transfer,
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
    const { product_detail, discount, bank, isSign, signatureID, transfer, product_head, } = req.body;

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

    const total_all_end = (total - total_payment - discountValue);

    const updatedReceiptVat = await ReceiptVat.findOneAndUpdate(
      { _id: customer_number },
      {
        $set: {
          product_head: product_head,
          product_detail: updatedProductDetail,
          total: total,
          discount: discountValue,
          discount_persen: discount_percent,
          transfer: transfer,
          isSign: isSign,
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
          "total_products.after_discoun_payment": total_payment,
          "total_products.total_all_end": total_all_end,
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
          signature: signatureData,
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

exports.newReceiptRefInvoice = async (req, res) => {
  try {
    const {
      invoiceId,
      start_date,
      amount_price,
      remark,
      transfer,
      paid_detail,
      isSign
    } = req.body

    const invoice = await Invoice.findOne({
      invoice : invoiceId
    })
    if ( !invoice ) {
      return res.status(404).send({
        message: "ไม่พบเลขที่ใบแจ้งหนี้นี้ในระบบ",
        status: false,
      })
    }
    const code = await invoiceNumber()
    const newReceipt = {
      receipt: code,
      quotation: invoice.quotation || null,
      invoice: invoice.invoice || null,
      customer_branch: invoice.customer_branch,
      customer_detail: invoice.customer_detail,
      product_detail: invoice.product_detail,
      total: invoice.total,
      amount_price: amount_price,
      transfer: transfer,
      discount: invoice.discount,
      net: invoice.net,
      vat: invoice.vat,
      isSign: isSign,
      total_products: invoice.total_products,
      sumVat: invoice.sumVat,
      withholding: invoice.withholding,
      isVat: invoice.isVat,
      status: [
        {
          name: "new",
          createdAt: new Date()
        }
      ],
      start_date: start_date,
      signature: invoice.signature,
      remark: remark,
      bank: invoice.bank,
      invoiceRef_detail: {
        start_date: invoice.start_date,
        end_date: invoice.end_date,
        period: invoice.cur_period + 1,
        period_text: `${invoice.cur_period + 1}/${invoice.end_period}`,
        paid: invoice.paid + amount_price || 0,
        paid_detail: paid_detail
      }
    }

    const new_receipt = new ReceiptVat(newReceipt)
    const saved_receipt = await new_receipt.save()
    if ( !saved_receipt) {
      return res.status(500).send({
        message: "ไม่สามารถบันทึกใบเสร็จได้",
        status: false
      })
    }

    invoice.status.push({
      name: `${invoice.cur_period + 1}/${invoice.end_period}`,
      paid: amount_price,
      period: invoice.cur_period + 1, 
      receipt: saved_receipt.receipt,
      createdAt: start_date
    })
    invoice.cur_period += 1
    invoice.paid += amount_price
    const updated_invoice = await invoice.save()
    if( !updated_invoice ) {
      return res.status(500).send({
        message: "ไม่สามารถอัพเดทสถานะใบแจ้งหนี้",
        status: false,
      })
    }

    return res.status(200).send({
      message: "สร้างใบเสร็จรับเงินสำเร็จ",
      status: true,
      data: saved_receipt,
      ref_invoice: updated_invoice
    })

  } catch (error) {
    console.log(error);
    return res.status(500).send({
      message: "มีบางอย่างผิดพลาด",
      status: false,
      error: error.message,
    })
  }
}

exports.editReceiptRefInvoice = async (req, res) => {
  const { id } = req.params
  try {
    const {
      //invoiceId,
      //start_date,
      //amount_price,
      remark,
      transfer,
      paid_detail,
      isSign
    } = req.body

    const receipt = await ReceiptVat.findByIdAndUpdate(id, {
      $set: {
        'invoiceRef_detail.paid_detail': paid_detail,
        //start_date: start_date,
        //amount_price: amount_price,
        //remark: remark,
        //transfer: transfer,
        //isSign: isSign
      }
    })
    if ( !receipt) {
      return res.status(500).send({
        message: "ไม่สามารถบันทึกใบเสร็จได้",
        status: false
      })
    }
    /* const inCode = receipt.invoice
    let invoice = await Invoice.findOne({invoice : inCode})
    console.log(invoice)
    console.log(inCode)
    invoice.status.push({
      name: `edit`,
      paid: amount_price,
      period: 0, 
      receipt: receipt.code,
      createdAt: start_date
    })

    const updated_invoice = await invoice.save()
    if( !updated_invoice ) {
      return res.status(500).send({
        message: "ไม่สามารถอัพเดทสถานะใบแจ้งหนี้",
        status: false,
      })
    } */

    return res.status(200).send({
      message: "สร้างใบเสร็จรับเงินสำเร็จ",
      status: true,
      data: receipt,
      //ref_invoice: updated_invoice
    })

  } catch (error) {
    console.log(error);
    return res.status(500).send({
      message: "มีบางอย่างผิดพลาด",
      status: false,
      error: error.message,
    })
  }
}

async function invoiceNumber() {
  const date = new Date()
  const order = await ReceiptVat.find();
  let invoice_number = null;
  if (order.length !== 0) {
    const data = `REP${dayjs(date).format("YYYYMMDD")}`.padEnd(15, "0") + order.length;
    invoice_number = data
  } else {
    invoice_number =
      `REP${dayjs(date).format("YYYYMMDD")}`.padEnd(15, "0") + "1";
  }
  return invoice_number;
}
