const router = require("express").Router();
const admin = require("../../controllers/admin/invoice.controller");
const Child = require("../../controllers/admin/childInvoice.controller");
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
router.put("/nextInvoice/:id", authAdmin, admin.createNextInvoice)

router.post("/child/create", authAdmin, Child.createChildInvoice)
router.put("/child/update/:id", authAdmin, Child.updateChildInvoice)
router.get("/child/one/:id", authAdmin, Child.getChildInvoice)
router.get("/child/all", authAdmin, Child.getChildInvoices)
router.delete("/child/delete/:id", authAdmin, Child.deleteChildInvoice)

module.exports = router;