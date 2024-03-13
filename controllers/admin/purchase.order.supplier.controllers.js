const bcrypt = require("bcrypt");
const dayjs = require("dayjs");
const Joi = require("joi");
const { google } = require("googleapis");
const { default: axios } = require("axios");
const req = require("express/lib/request.js");
const { Admins, validateAdmin } = require("../../models/admin/admin.models");
const { Suppliers } = require("../../models/supplier/supplier.model");
const { CostType } = require("../../models/costtype/cost_type.models");
const { Signature } = require("../../models/signature/signature.models");
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
    const { 
      product_detail, 
      note, 
      discount = 0, 
      total,
      net,
      code,
      supplier
    } = req.body

    const PurchaseOrder1 = await new PurchaseOrderSup({
      supplier_detail: {
        supplier_tel: supplier.supplier_tel,
        supplier_company_name: supplier.supplier_company_name,
        supplier_company_number: supplier.supplier_company_number,
        supplier_company_address: supplier.supplier_company_address,
        supplier_type: supplier.supplier_type
      },
      code: code,
      discount: discount,
      net: net,
      product_detail: product_detail,
      total: total,
      note: note,
      timestamps: new Date(),
    }).save()

    if (PurchaseOrder1) {
      return res.status(200).send({
        status: true,
        message: "สร้างใบสั่งชื้อสินค้าสำเร็จ",
        data: PurchaseOrder1,
      });
    } else {
      return res.status(500).send({
        message: "มีบางอย่างผิดพลาด",
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

exports.EditPurchaseOS = async (req, res) => {
  try {
    const { id } = req.params
    const { 
      product_detail, 
      note, 
      discount = 0, 
      total,
      net,
      code,
      supplier
    } = req.body

    let PurchaseOrder1 = await PurchaseOrderSup.findById( id )
    if(!PurchaseOrder1) {
      return res.send({
        message: 'ไม่พบเอกสาร',
        status: false,
        data: null
      })
    }
    
    PurchaseOrder1.supplier_detail = {
      supplier_tel: supplier.supplier_tel,
      supplier_company_name: supplier.supplier_company_name,
      supplier_company_number: supplier.supplier_company_number,
      supplier_company_address: supplier.supplier_company_address,
      supplier_type: supplier.supplier_type
    }
    PurchaseOrder1.code = code
    PurchaseOrder1.discount = discount
    PurchaseOrder1.net = net
    PurchaseOrder1.product_detail = product_detail
    PurchaseOrder1.total = total
    PurchaseOrder1.note = note
    
    const saved_data = await PurchaseOrder1.save()

    if (saved_data) {
      return res.status(200).send({
        status: true,
        message: "แก้ไขเอกสารสำเร็จ",
        data: saved_data,
      })
    } else {
      return res.status(500).send({
        message: "มีบางอย่างผิดพลาด",
        status: false,
        data: null
      })
    }
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, message: "มีบางอย่างผิดพลาด", data: null });
  }
};

exports.getPOSByIdPOS = async (req, res) => {
  try {
    const pos = await PurchaseOrderSup.find({}, { _id: 1, purchase_order: 1 });
    if (!pos || pos.length === 0) {
      return res
        .status(404)
        .send({ status: false, message: "ไม่พบข้อมูลใบสั่งซื้อ" });
    } else {
      return res
        .status(200)
        .send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: pos });
    }
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, message: "มีบางอย่างผิดพลาด" });
  }
};
exports.getPOSById = async (req, res) => {
  try {
    const id = req.params.id;
    console.log(id);
    const pos = await PurchaseOrderSup.findById(id);
    if (!pos) {
      return res.status(404).send({
        status: false,
        message: "ไม่พบข้อมูลรายการ ใบสั่งชื้อ",
      });
    } else {
      return res
        .status(200)
        .send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: pos });
    }
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, message: "มีบางอย่างผิดพลาด" });
  }
};
exports.getPosAll = async (req, res) => {
  try {
    const pos = await PurchaseOrderSup.find();
    if (!pos) {
      return res
        .status(404)
        .send({ status: false, message: "ไม่พบใบสั่งชื้อ" });
    } else {
      return res
        .status(200)
        .send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: pos });
    }
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, message: "มีบางอย่างผิดพลาด" });
  }
};
exports.deletePosByid = async (req, res) => {
  try {
    const id = req.params.id;
    const pos = await PurchaseOrderSup.findByIdAndDelete(id);
    if (!pos) {
      return res
        .status(404)
        .send({ status: false, message: "ไม่พบใบสั่งชื้อ" });
    } else {
      return res
        .status(200)
        .send({ status: true, message: "ลบข้อมูลใบสั่งชื้อเสร็จสำเร็จ" });
    }
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, message: "มีบางอย่างผิดพลาด" });
  }
};
exports.deleteAllPos = async (req, res) => {
  try {
    const result = await PurchaseOrderSup.deleteMany({});

    if (result.deletedCount > 0) {
      return res
        .status(200)
        .send({ status: true, message: "ลบข้อมูลใบสั่งชื้อเสร็จสำเร็จ" });
    } else {
      return res
        .status(404)
        .send({ status: false, message: "ไม่พบใบสั่งชื้อ" });
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
      const productId = req.params.id; 
      const PurchaseOSId = req.params.PurchaseOSId;
      if (req.files && req.files.length > 0) {
        const updated = await PurchaseOrderSup.findOneAndUpdate(
          {
            _id: PurchaseOSId,
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

        if (updated) {
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
