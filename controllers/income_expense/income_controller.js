const Income = require("../../models/income_expense/income_model.js")
const ReceiptVat = require("../../models/order/receiptVat_model")

exports.createIncome = async (req, res) => {
    try {
        const { name, detail, amount, type, refer, user, date } = req.body
        if (!name || !amount || amount <= 0) {
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
        const income = await Income.create(newData)
        if (!income) {
            return res.status(400).json({
                message: "error created!"
            })
        }

        return res.status(200).json({
            message: "success!",
            status: true,
            data: income
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.updateIncome = async (req, res) => {
    try {
        const { name, detail, amount, type, refer, date } = req.body
        if (!name || !amount || amount <= 0) {
            return res.status(400).json({
                message: "require name and amount greater than 0"
            })
        }
        const { id } = req.params
        if (!id) {
            return res.status(404).json({
                message: "not found id"
            })
        }
        const income = await Income.findByIdAndUpdate(id, {
            $set: {
                name: name,
                detail: detail,
                amount: amount,
                type: type,
                refer: refer,
                date: date
            }
        })
        if (!income) {
            return res.status(404).json({
                message: "not found!"
            })
        }

        return res.status(201).json({
            message: "success!",
            status: true,
            data: income
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.getIncome = async (req, res) => {
    try {
        const { id } = req.params
        if (!id) {
            return res.status(404).json({
                message: "not found id"
            })
        }
        const income = await Income.findById(id)
        if (!income) {
            return res.status(404).json({
                message: "not found!"
            })
        }

        return res.status(200).json({
            message: "success!",
            status: true,
            data: income
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.getIncomes = async (req, res) => {
    try {
        const incomes = await Income.find()
        const receiptVats = await ReceiptVat.find().select("_id no date status summary customer")
        const activeReceiptVats = receiptVats.filter(re => re.status[re.status.length-1]?.name === 'confirm')
        const receiptVat_ids = activeReceiptVats.map(re => re._id.toString())
        const formatIncomes = incomes.filter(income =>
            receiptVat_ids.includes(income.refer?.refer_id)
            || !income.refer?.refer_id
        )
        const incomeReferIds = formatIncomes.map(inc => inc.refer?.refer_id)
        const uncommitReceiptVats = activeReceiptVats.filter(re => !incomeReferIds.includes(re._id.toString()))
        const amounts = formatIncomes.length ? formatIncomes.map(inc => inc.amount) : []
        const total_amount = amounts.length ? amounts.reduce((a, b) => a + b, 0) : 0

        return res.status(200).json({
            message: "success!",
            status: true,
            data: {
                receipts: uncommitReceiptVats,
                incomes: formatIncomes,
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

exports.deleteIncome = async (req, res) => {
    try {
        const { id } = req.params
        if (!id) {
            return res.status(404).json({
                message: "not found id"
            })
        }
        const income = await Income.findByIdAndDelete(id)
        if (!income) {
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

