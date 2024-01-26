const router = require("express").Router();
const admin = require("../../controllers/admin/receipt.vat.controller");
const authAdmin = require("../../lib/auth.admin");

router.post("/Create", authAdmin, admin.ReceiptVat)//ออกใบเสร็จแบบมี vat 
router.post("/ReceiptVat", authAdmin, admin.PrintReceiptVat)//ออกใบเสร็จแบบมี vat เเละกรอกเอง
router.delete("/deleteReceiptVat/:id", authAdmin, admin.deleteReceiptVat)
router.delete("/deleteAllReceiptVat", authAdmin, admin.deleteAllReceiptVat)
router.get("/getReceiptVatAll", authAdmin, admin.getReceiptVatAll)
router.get("/getReceiptVatBy/:id", authAdmin, admin.getReceiptVatById)
router.get("/getReceiptVatByREB/:id", authAdmin, admin.getReceiptVatByREB)
module.exports = router;