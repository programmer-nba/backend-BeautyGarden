const router = require("express").Router();
const admin = require("../../controllers/admin/purchase.order.controller");
const authAdmin = require("../../lib/auth.admin");

router.post("/Create", authAdmin, admin.purchaseOrder)//ใบสั่งชื้อแบบ BY ID
router.post("/PrintPOVat", authAdmin, admin.PrintPOVat)//สร้างใบสั่งชื้อแบบกรอกมือ
router.delete("/deletepurchaseOrder/:id", authAdmin, admin.deletepurchaseOrder)
router.delete("/deleteAllPO", authAdmin, admin.deleteAllPO)
router.get("/getPurchaserderAll", authAdmin, admin.getPurchaserderAll)
router.get("/getPurchaserderBy/:id", authAdmin, admin.getPurchaserderById)
router.get("/getPDBy/:id", authAdmin, admin.getPDByIds)
router.get("/getPOAllfilter", authAdmin, admin.getPOAllfilter)
module.exports = router;  