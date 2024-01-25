const router = require("express").Router();
const branch = require("../../controllers/branch/branch.controllers")
const authAdmin = require("../../lib/auth.admin")


router.post("/createBranch",authAdmin, branch.create)
router.post("/ImportBank/:id",authAdmin, branch.ImportBank)
router.put("/EditBranch/:id",authAdmin, branch.EditBranch)
router.get("/getBranchAll",authAdmin, branch.getBranchAll)
router.get("/getBranchBy/:id",authAdmin, branch.getBranchById)
router.delete("/deleteBranch/:id",authAdmin, branch.deleteBranch)
router.delete("/deleteAllBranch",authAdmin, branch.deleteAllBranch)

module.exports = router;