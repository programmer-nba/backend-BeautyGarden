const router = require("express").Router();
const admin = require("../../controllers/admin/receipt.no.vat.controller");
const authAdmin = require("../../lib/auth.admin");

router.post("/Create", authAdmin, admin.ReceiptNoVat)//ออกใบเสร็จแบบไม่มี vat 
router.post("/Create/Nodata",authAdmin,admin.EditReceiptNoVat)//ออกใบเสร้จแบบกรอกมือเอาเเละไม่มี vat


module.exports = router;