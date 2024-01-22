const router = require("express").Router();
const admin = require("../../controllers/admin/receipt.no.vat.controller");
const authAdmin = require("../../lib/auth.admin");

router.post("/Create/:id", authAdmin, admin.ReceiptNoVat)


module.exports = router;