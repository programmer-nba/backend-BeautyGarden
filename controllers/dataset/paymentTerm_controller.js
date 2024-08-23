const PaymentTerm = require("../../models/dataset/paymentTerm_model")

exports.createPaymentTerm = async (req, res) => {
    const { name } = req.body
    try {
        const paymentTerm = await PaymentTerm.create({
            name
        })
        return res.status(201).json({
            message: "success",
            status: true,
            data: paymentTerm
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.updatePaymentTerm = async (req, res) => {
    const { name } = req.body
    const { id } = req.params
    try {
        const paymentTerm = await PaymentTerm.findByIdAndUpdate(id, {
            $set: {
                name: name
            }
        }, { new: true })
        if (!paymentTerm) {
            return res.status(404).json({
                message: "data not found"
            })
        }

        return res.status(201).json({
            message: "success",
            status: true,
            data: paymentTerm
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}


exports.getPaymentTerm = async (req, res) => {
    const { id } = req.params
    try {
        const paymentTerm = await PaymentTerm.findById(id)
        if (!paymentTerm) {
            return res.status(404).json({
                message: "data not found"
            })
        }

        return res.status(200).json({
            message: "success",
            status: true,
            data: paymentTerm
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}


exports.getPaymentTerms = async (req, res) => {
    try {
        const paymentTerms = await PaymentTerm.find()
        return res.status(200).json({
            message: "success",
            status: true,
            data: paymentTerms
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}


exports.deletePaymentTerm = async (req, res) => {
    const { id } = req.params
    try {
        const paymentTerm = await PaymentTerm.findByIdAndDelete(id)
        if (!paymentTerm) {
            return res.status(404).json({
                message: "data not found"
            })
        }

        return res.status(200).json({
            message: "success",
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