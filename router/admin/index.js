const router = require("express").Router();
const admin = require("../../controllers/admin/admin.controllers")


router.post("/create", admin.create);
router.put("/EditAdmin/:id", admin.EditAdmin);
router.delete("/EditAdmin/:id", admin.deleteAdmins);


module.exports = router; 