require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const connection = require("./config/db");
connection();
app.use(express.json());
app.use(cors());


app.use("/", require("./router"));

//สร้างเเอดมิน
app.use("/beautygraden/admin", require("./router/admin"));
app.use("/beautygraden/quotation", require("./router/admin/quotation"))//ใบเสนอราคา
app.use("/beautygraden/receiptNoVat", require("./router/admin/receipt.no.vat"))//ใบเสร็จแบบไม่มี vat
app.use("/beautygraden/receiptVat", require("./router/admin/receipt.vat"))//ใบเสร็จแบบมี vat

//สร้างสมาชิก
app.use("/beautygraden/member" ,require("./router/member/index"))

//สร้างลูกค้า
app.use("/beautygraden/customer" , require("./router/customer/index"))

//สร้างสาขา
app.use("/beautygraden/branch" ,require("./router/branch/index"))


const port = process.env.PORT || 4348;
app.listen(port, console.log(`Listening on port ${port}`));