const router = require("express").Router()
const Income = require("../../controllers/income_expense/income_controller.js")
const Expense = require("../../controllers/income_expense/expense_controller.js")

router.post("/income", Income.createIncome)
router.put("/income/:id", Income.updateIncome)
router.get("/incomes", Income.getIncomes)
router.get("/income/:id", Income.getIncome)
router.delete("/income/:id", Income.deleteIncome)

router.post("/expense", Expense.createExpense)
router.put("/expense/:id", Expense.updateExpense)
router.get("/expenses", Expense.getExpenses)
router.get("/expense/:id", Expense.getExpense)
router.delete("/expense/:id", Expense.deleteExpense)

module.exports = router