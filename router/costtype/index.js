const router = require("express").Router();
const authAdmin = require("../../lib/auth.admin");
const CostType = require("../../controllers/costtype/cost.type.controllers")

router.post("/create" ,authAdmin,CostType.create)
router.get("/getCostTypeBy/:id" ,authAdmin,CostType.getCostTypeById)
router.get("/getCostTypeAll" ,authAdmin,CostType.getCostTypeAll)
router.put("/updateCostType/:id" ,authAdmin,CostType.updateCostType)
router.delete("/deleteCostType/:id" ,authAdmin,CostType.deleteCostType)
router.delete("/deleteAllCostTyper" ,authAdmin,CostType.deleteAllCostTyper)

module.exports = router;