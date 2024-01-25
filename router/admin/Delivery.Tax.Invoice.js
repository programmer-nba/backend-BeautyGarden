const router = require("express").Router();
const admin = require("../../controllers/admin/Delivery.Tax.Invoice.controllers");
const authAdmin = require("../../lib/auth.admin");


router.post("/Create", authAdmin, admin.ReceiptDTVat)
router.post("/PrintOTVat", authAdmin, admin.PrintOTVat)



module.exports = router;  