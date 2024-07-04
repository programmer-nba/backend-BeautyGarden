require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const connection = require("./config/db");
connection();
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '100mb' }));
app.use(cors());

const prefix = "/beautygraden";

app.use(prefix + "/", require("./router/index"));

app.use(prefix, require("./router/document"));
app.use(prefix, require("./router/order"));
app.use(prefix, require("./router/product"));
app.use(prefix, require("./router/client"));
app.use(prefix, require("./router/income_expense"));

// app.use(prefix+'/log',require("./router/index"))

//สร้างเเอดมิน
app.use(prefix + "/admin", require("./router/admin"));
app.use(prefix + "/project", require("./router/admin/project.route"));
app.use(prefix + "/quotation", require("./router/admin/quotation")); //ใบเสนอราคา
app.use(prefix + "/invoice", require("./router/admin/invoice")); //ใบเเจ้งหนี้
app.use(prefix + "/receiptNoVat", require("./router/admin/receipt.no.vat")); //ใบเสร็จแบบไม่มี vat
app.use(prefix + "/receiptVat", require("./router/admin/receipt.vat")); //ใบเสร็จแบบมี vat
app.use(prefix + "/purchaseOrder", require("./router/admin/purchase.order")); //ใบคำสั่งชื้อ
app.use(
  prefix + "/DeliveryTaxInvoice",
  require("./router/admin/Delivery.Tax.Invoice")
); //ใบส่งสินค้า เเละ ใบ กำกับภาษี
app.use(
  prefix + "/PurchaseOrderSupllier",
  require("./router/admin/purchase.order.supllier")
);

//สร้างพนักงานบํญชี
app.use(prefix + "/accountant", require("./router/accountant/index"));

//สร้างลายเซ็น
app.use(prefix + "/signature", require("./router/signature/index"));

//สร้างสมาชิก
app.use(prefix + "/member", require("./router/member/index"));

//สร้างลูกค้า
app.use(prefix + "/customer", require("./router/customer/index"));

//สร้างข้อมูลบริษัท
app.use(prefix + "/Company", require("./router/Company/index"));

//สร้างสาขา
app.use(prefix + "/branch", require("./router/branch/index"));

//สร้าง supplier
app.use(prefix + "/supplier", require("./router/supplier/index"));

app.use(prefix + "/costtype", require("./router/costtype/index"));

app.use(prefix + "/picture64", require("./router/admin/picture64.route"));

const port = process.env.PORT || 4348;
app.listen(port, console.log(`Listening on port ${port}`));
