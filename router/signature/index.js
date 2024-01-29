const router = require("express").Router();
const admin = require("../../controllers/signature/signature.controllers");
const authAdmin = require("../../lib/auth.admin");

router.post("/create", authAdmin, admin.create);
router.put("/EditSugnature/:id", authAdmin, admin.EditSugnature)
router.get("/getSugnatureAlls",authAdmin,admin.getSugnatureAlls)
router.get("/getSugnatureBy/:id",authAdmin,admin.getSugnatureById)
router.delete("/deleteAllSugnature",authAdmin,admin.deleteAllSugnature)
router.delete("/deleteSugnature/:id",authAdmin,admin.deleteSugnature)
module.exports = router;
