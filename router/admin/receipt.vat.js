const router = require("express").Router();
const admin = require("../../controllers/admin/receipt.vat.controller");
const authAdmin = require("../../lib/auth.admin");

router.post("/Create", authAdmin, admin.ReceiptVat)//ออกใบเสร็จแบบมี vat 
router.post("/ReceiptVat", authAdmin, admin.PrintReceiptVat)//ออกใบเสร็จแบบมี vat เเละกรอกเอง
module.exports = router;