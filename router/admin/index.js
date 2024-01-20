const router = require("express").Router();
const admin = require("../../controllers/admin/admin.controllers")
const authAdmin =require("../../lib/auth.admin")


router.post("/create",authAdmin, admin.create);
router.put("/EditAdmin/:id",authAdmin, admin.EditAdmin);
router.delete("/EditAdmin/:id",authAdmin, admin.deleteAdmins);
router.get("/getAdminAll", authAdmin,admin.getAdminAll)
router.get("/getAdminBy/:id",authAdmin, admin.getAdminsById)
module.exports = router; 