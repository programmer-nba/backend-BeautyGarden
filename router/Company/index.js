const router = require("express").Router();
const Company = require("../../controllers/company/company.controllers")
const authAdmin = require("../../lib/auth.admin")



router.post("/createCompany",authAdmin, Company.create)



module.exports = router;