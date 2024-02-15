const router = require("express").Router();
const admin = require("../../controllers/admin/purchase.order.supplier.controllers");
const authAdmin = require("../../lib/auth.admin");

router.post("/Create", authAdmin, admin.Create);
router.put("/EditPurchaseOS/:id", authAdmin, admin.EditPurchaseOS);
router.get("/getPOSById", authAdmin, admin.getPOSByIdPOS);
router.get("/getPOSBy/:id", authAdmin, admin.getPOSById);
router.get("/getPosAll", authAdmin, admin.getPosAll);
router.delete("/getPOSBy/:id", authAdmin, admin.deletePosByid);
router.delete("/deleteAllPos", authAdmin, admin.deleteAllPos);
router.put(
  "/ImportImgProduct/:id/:PurchaseOSId",
  authAdmin,
  admin.ImportImgProduct
);
module.exports = router;
