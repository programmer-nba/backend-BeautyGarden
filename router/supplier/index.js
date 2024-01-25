const router = require("express").Router();
const member = require("../../controllers/member/member.controllers");
const supplier = require("../../controllers/supplier/supplier.controller");
const authMember = require("../../lib/auth.member");
const authAdmin = require("../../lib/auth.admin");


router.post("/create",authAdmin, supplier.create);
router.delete("/deleteSupplier/:id",authAdmin, supplier.deleteSuppliers)
router.delete("/deleteAllSupplier",authAdmin, supplier.deleteAllSupplier)
router.put("/updateSupplier/:id",authAdmin, supplier.updateSupplier)
router.put("/updateImgIden/:id",authAdmin, supplier.updateImgIdens)
router.put("/updateImgBank/:id",authAdmin, supplier.updateImgBank)
router.get("/getSupplierAll",authAdmin, supplier.getSupplierAll)
router.get("/getSupplierBy/:id",authAdmin, supplier.getSupplierById)

module.exports = router;
