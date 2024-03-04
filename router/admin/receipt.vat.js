const router = require("express").Router();
const admin = require("../../controllers/admin/receipt.vat.controller");
const authAdmin = require("../../lib/auth.admin");

router.post("/Create", authAdmin, admin.ReceiptVat)//ออกใบเสร็จแบบมี vat 
router.post("/ReceiptVat", authAdmin, admin.PrintReceiptVat)//ออกใบเสร็จแบบมี vat เเละกรอกเอง
router.put("/EditReceiptVat/:id", authAdmin, admin.EditReceiptVat)
router.delete("/deleteReceiptVat/:id", authAdmin, admin.deleteReceiptVat)
router.delete("/deleteAllReceiptVat", authAdmin, admin.deleteAllReceiptVat)
router.get("/getReceiptVatAll", authAdmin, admin.getReceiptVatAll)
router.get("/getReceiptVatBy/:id", authAdmin, admin.getReceiptVatById)
router.get("/getReceiptVatByREP/:id", authAdmin, admin.getReceiptVatByREP)
router.get("/getREPAllfilter", authAdmin, admin.getREPAllfilter)
router.post("/ReceiptRefInvoice", authAdmin, admin.newReceiptRefInvoice)
router.put("/ReceiptRefInvoice/:id", authAdmin, admin.editReceiptRefInvoice)
module.exports = router;