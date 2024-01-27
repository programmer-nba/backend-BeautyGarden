const bcrypt = require("bcrypt");
const dayjs = require("dayjs");
const Joi = require("joi");
const { google } = require("googleapis");
const { default: axios } = require("axios");
const req = require("express/lib/request.js");
const { Admins, validateAdmin } = require("../../models/admin/admin.models");
const { CostType } = require("../../models/costtype/cost_type.models");
const mongoose = require("mongoose");
const {
  PurchaseOrderSup,
} = require("../../models/admin/purchase.order.supplier.models");
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

exports.Create = async (req, res) => {
  try {
    const { product_detail, note, discount = 0 } = req.body;

    let total = 0;
    const productCostTypes = product_detail.map(
      (product) => product.product_cost_type
    );
    const costTypes = await CostType.find({ _id: { $in: productCostTypes } }) 
    const updatedProductDetail = product_detail.map((product) => {
      const price = product.product_price;
      const amount = product.product_amount;
      const product_total = (price * amount).toFixed(2);
      total += +product_total;

      const costType = costTypes.find(
        (type) => type._id.toString() === product.product_cost_type
      );
      return {
        ...product,
        product_total,
        product_cost_type: costType ? costType.cost_name : null,
      };
    });

    const net = discount ? total - discount : total;
    const purchaseOrder = await purchaseOrderNumber();

    const PurchaseOrder1 = await new PurchaseOrderSup({
      ...req.body,
      customer_detail: {
        ...req.body.customer_detail,
      },
      purchase_order: purchaseOrder,
      discount: discount.toFixed(2),
      net: net,
      product_detail: updatedProductDetail,
      total: total.toFixed(2),
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
  const order = await PurchaseOrderSup.find();
  let pos_number = null;
  if (order.length !== 0) {
    let data = "";
    let num = 0;
    let check = null;
    do {
      num = num + 1;
      data = `POS${dayjs(date).format("YYYYMMDD")}`.padEnd(15, "0") + num;
      check = await PurchaseOrderSup.find({ purchase_order: data });
      if (check.length === 0) {
        pos_number =
          `POS${dayjs(date).format("YYYYMMDD")}`.padEnd(15, "0") + num;
      }
    } while (check.length !== 0);
  } else {
    pos_number = `POS${dayjs(date).format("YYYYMMDD")}`.padEnd(15, "0") + "1";
  }
  return pos_number;
}
