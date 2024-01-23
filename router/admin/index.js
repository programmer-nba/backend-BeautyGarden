const router = require("express").Router();
const admin = require("../../controllers/admin/admin.controllers");
const authAdmin = require("../../lib/auth.admin");

router.post("/create", admin.create);
router.put("/EditAdmin/:id", admin.EditAdmin);
router.delete("/EditAdmin/:id", admin.deleteAdmins);
router.get("/getAdminAll", admin.getAdminAll);
router.get("/getAdminBy/:id", admin.getAdminsById);
module.exports = router;
