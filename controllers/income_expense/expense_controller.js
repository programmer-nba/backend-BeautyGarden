const Expense = require("../../models/income_expense/expense_model.js")

exports.createExpense = async (req, res) => {
    try {
        const { name, detail, amount, type, refer, user, date } = req.body
        if (!amount || amount <= 0) {
            return res.status(400).json({
                message: "require name and amount greater than 0"
            })
        }
        const newData = {
            user: user,
            name: name,
            detail: detail,
            amount: amount,
            type: type,
            refer: refer,
            date: date
        }
        const expense = await Expense.create(newData)
        if (!expense) {
            return res.status(400).json({
                message: "error created!"
            })
        }

        return res.status(200).json({
            message: "success!",
            status: true,
            data: expense
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.updateExpense = async (req, res) => {
    try {
        const { name, detail, amount, type, refer, date } = req.body
        if (!amount || amount <= 0) {
            return res.status(400).json({
                message: "require amount greater than 0"
            })
        }
        const { id } = req.params
        if (!id) {
            return res.status(404).json({
                message: "not found id"
            })
        }
        const expense = await Expense.findByIdAndUpdate(id, {
            $set: {
                name: name,
                detail: detail,
                amount: amount,
                type: type,
                refer: refer,
                date: date
            }
        })
        if (!expense) {
            return res.status(404).json({
                message: "not found!"
            })
        }

        return res.status(201).json({
            message: "success!",
            status: true,
            data: expense
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.getExpense = async (req, res) => {
    try {
        const { id } = req.params
        if (!id) {
            return res.status(404).json({
                message: "not found id"
            })
        }
        const expense = await Expense.findById(id)
        if (!expense) {
            return res.status(404).json({
                message: "not found!"
            })
        }

        return res.status(200).json({
            message: "success!",
            status: true,
            data: expense
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.getExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find()

        const amounts = expenses.map(ex => ex.amount || 0)
        const total_amount = amounts.reduce((a, b) => a + b, 0)

        return res.status(200).json({
            message: "success!",
            status: true,
            data: {
                expenses: expenses,
                total_amount: total_amount
            }
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.deleteExpense = async (req, res) => {
    try {
        const { id } = req.params
        if (!id) {
            return res.status(404).json({
                message: "not found id"
            })
        }
        const expense = await Expense.findByIdAndDelete(id)
        if (!expense) {
            return res.status(404).json({
                message: "not found!"
            })
        }

        return res.status(200).json({
            message: "success!",
            status: true,
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

