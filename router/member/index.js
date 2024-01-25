const router = require("express").Router();
const member = require("../../controllers/member/member.controllers")
const authMember = require("../../lib/auth.member")
const authAdmin = require("../../lib/auth.admin")

router.post("/createMember",authAdmin, member.createMember);
router.put("/EditMember/:id", authAdmin, member.EditMember);
router.delete("/deleteMember/:id",authAdmin, member.deleteMember);
router.delete("/deleteAllMember",authAdmin, member.deleteAllMember)
router.get("/getMemberAll",authAdmin, member.getMemberAll)
router.get("/getMemberBy/:id",authAdmin, member.getMemberById)
module.exports = router; 