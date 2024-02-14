const router = require("express").Router();
const admin = require("../../controllers/admin/invoice.controller");
const authAdmin = require("../../lib/auth.admin");


router.post("/Create", authAdmin, admin.ReceiptInvoiceVat)
router.post("/PrintInviuceVat", authAdmin, admin.PrintInviuceVat)
router.get("/getInvoiceVatAll", authAdmin, admin.getInvoiceVatAll)
router.get("/getInvoiceVatBy/:id", authAdmin, admin.getInvoiceVatById)
router.get("/getIVVatByIdS/:id", authAdmin, admin.getIVVatByIdS)
router.get("/getIVAllfilter", authAdmin, admin.getIVAllfilter)
router.delete("/deleteInvoice/:id", authAdmin, admin.deleteInvoice)
router.delete("/deleteAllInvoice", authAdmin, admin.deleteAllInvoice)
router.put("/EditInvoice/:id", authAdmin, admin.EditInvoice)
module.exports = router;  