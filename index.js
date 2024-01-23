require("dotenv").config();
const express = require("express");
const app = express();
//const bodyParser = require("body-parser");
const cors = require("cors");
const connection = require("./config/db");
connection();
app.use(express.json());
app.use(cors());

const prefix = "/beautygraden";

app.use(prefix + "/", require("./router/index"));

// app.use(prefix+'/log',require("./router/index"))



//สร้างเเอดมิน
app.use(prefix +"/admin", require("./router/admin"));
app.use(prefix +"/quotation", require("./router/admin/quotation")); //ใบเสนอราคา
app.use(prefix +"/receiptNoVat", require("./router/admin/receipt.no.vat")); //ใบเสร็จแบบไม่มี vat
app.use(prefix +"/receiptVat", require("./router/admin/receipt.vat")); //ใบเสร็จแบบมี vat

//สร้างสมาชิก
app.use(prefix +"/beautygraden/member", require("./router/member/index"));

//สร้างลูกค้า
app.use(prefix +"/beautygraden/customer", require("./router/customer/index"));

//สร้างสาขา
app.use(prefix +"/beautygraden/branch", require("./router/branch/index"));

const port = process.env.PORT || 4348;
app.listen(port, console.log(`Listening on port ${port}`));
