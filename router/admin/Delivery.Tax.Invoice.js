const router = require("express").Router();
const admin = require("../../controllers/admin/Delivery.Tax.Invoice.controllers");
const authAdmin = require("../../lib/auth.admin");


router.post("/Create", authAdmin, admin.ReceiptDTVat)
router.post("/PrintOTVat", authAdmin, admin.PrintOTVat)
router.get("/getDTAll", authAdmin, admin.getDTAll)
router.get("/getDTBy/:id", authAdmin, admin.getDTById)
router.delete("/deleteDT/:id", authAdmin, admin.deleteDT)
router.delete("/deleteAllDT", authAdmin, admin.deleteAllDT)
router.get("/getDTByIdDT/:id", authAdmin, admin.getDTByIdDT)
router.get("/getDTAllfilter", authAdmin, admin.getDTAllfilter)
module.exports = router;  