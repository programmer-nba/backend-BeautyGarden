const router = require("express").Router();
const Company = require("../../controllers/company/company.controllers")
const authAdmin = require("../../lib/auth.admin")



router.post("/createCompany",authAdmin, Company.create)
router.put("/InsertImg",authAdmin, Company.InsertImg)
router.get("/getImgAll",authAdmin, Company.getImgAll)
router.put("/ImportBankCompany/:id",authAdmin, Company.ImportBankCompany)
router.put("/EditCompany/:id",authAdmin, Company.EditCompany)
router.delete("/deleteCompany/:id",authAdmin, Company.deleteCompany)
router.delete("/deleteAllCompany",authAdmin, Company.deleteAllCompany)
router.get("/getCompannyAll",authAdmin, Company.getCompannyAlls)
router.get("/getCompanyBy/:id",authAdmin, Company.getCompanyById)

module.exports = router;