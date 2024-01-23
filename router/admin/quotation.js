const router = require("express").Router();
const admin = require("../../controllers/admin/quotation.controllers");
const authAdmin = require("../../lib/auth.admin");


router.post("/Create", authAdmin, admin.QuotationVat)
router.post("/CreateVat", authAdmin, admin.Quotation)
router.put("/EditQuotation/:id", authAdmin, admin.EditQuotation)
router.delete("/deleteQuotation/:id", authAdmin, admin.deleteQuotation)
router.delete("/deleteAllQuotation", authAdmin, admin.deleteAllQuotation)
router.get("/getQuotationAll",authAdmin,admin.getQuotationAll)
module.exports = router;  