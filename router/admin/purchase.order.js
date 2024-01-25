const router = require("express").Router();
const admin = require("../../controllers/admin/purchase.order.controller");
const authAdmin = require("../../lib/auth.admin");

router.post("/Create", authAdmin, admin.purchaseOrder)//ใบสั่งชื้อแบบ BY ID
router.post("/PrintPOVat", authAdmin, admin.PrintPOVat)//สร้างใบสั่งชื้อแบบกรอกมือ

module.exports = router;  