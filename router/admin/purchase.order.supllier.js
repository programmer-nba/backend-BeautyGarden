const router = require("express").Router();
const admin = require("../../controllers/admin/purchase.order.supplier.controllers");
const authAdmin = require("../../lib/auth.admin");

router.post("/Create", authAdmin, admin.Create)

module.exports = router;  