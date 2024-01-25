const router = require("express").Router();
const accountant = require("../../controllers/accountant/accountant.controllers");
const authAdmin = require("../../lib/auth.admin");

router.post("/create", authAdmin, accountant.create);
router.put("/EditAccountant/:id", authAdmin, accountant.EditAccountant);
router.delete("/deleteAccountant/:id", authAdmin, accountant.deleteAccountant);
router.delete("/deleteAllAccountant", authAdmin, accountant.deleteAllAccountant)
router.get("/getAccountantAll", authAdmin, accountant.getAccountantAll);
router.get("/getAccountantBy/:id", authAdmin, accountant.getAccountantById);
module.exports = router;
