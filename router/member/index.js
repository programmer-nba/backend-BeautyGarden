const router = require("express").Router();
const member = require("../../controllers/member/member.controllers")
const authMember = require("../../lib/auth.member")

router.post("/createMember", member.createMember);

module.exports = router; 