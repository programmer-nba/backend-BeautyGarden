const router = require("express").Router();
const admin = require("../../controllers/admin/invoice.controller");
const authAdmin = require("../../lib/auth.admin");


router.post("/Create", authAdmin, admin.ReceiptInvoiceVat)
router.post("/PrintInviuceVat", authAdmin, admin.PrintInviuceVat)
router.get("/getInvoiceVatAll", authAdmin, admin.getInvoiceVatAll)
router.get("/getInvoiceVatBy/:id", authAdmin, admin.getInvoiceVatById)
router.delete("/deleteInvoice/:id", authAdmin, admin.deleteInvoice)
router.delete("/deleteAllInvoice", authAdmin, admin.deleteAllInvoice)
module.exports = router;  