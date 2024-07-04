const router = require("express").Router()
const Income = require("../../controllers/income_expense/income_controller.js")
//const Expense = require("../../controllers/income_expense/expense_controller.js")

router.post("/income", Income.createIncome)
router.put("/income/:id", Income.updateIncome)
router.get("/incomes", Income.getIncomes)
router.get("/income/:id", Income.getIncome)
router.delete("/income/:id", Income.deleteIncome)

module.exports = router