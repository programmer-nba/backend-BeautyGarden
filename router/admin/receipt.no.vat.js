const router = require("express").Router();
const admin = require("../../controllers/admin/receipt.no.vat.controller");
const authAdmin = require("../../lib/auth.admin");

router.post("/Create", authAdmin, admin.ReceiptNoVat)//ออกใบเสร็จแบบไม่มี vat 
router.post("/Create/Nodata",authAdmin,admin.PrintReceiptNoVat)//ออกใบเสร้จแบบกรอกมือเอาเเละไม่มี vat
router.get("/getReceiptAll",authAdmin,admin.getReceiptAll)
router.get("/getReceiptBy/:id",authAdmin,admin.getReceiptById)
router.delete("/deleteReceipt/:id",authAdmin,admin.deleteReceipt)
router.delete("/deleteAllReceipt",authAdmin,admin.deleteAllReceipt)
router.get("/getReceiptByREB/:id",authAdmin,admin.getReceiptByREB)
module.exports = router;