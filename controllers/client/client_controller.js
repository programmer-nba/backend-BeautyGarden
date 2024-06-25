const Client = require("../../models/client/client_model")

exports.createClient = async (req, res) => {
    const {
        name,
        address,
        tax_no,
        email
    } = req.body
    try {
        const code = "CS"
        const newData = {
            name: name,
            address: address,
            tax_no: tax_no,
            code: code,
            email: email
        }
        const client = await Client.create(newData)
        if (!client) {
            return res.status(400).json({
                message: "can not create data"
            })
        }

        return res.status(200).json({
            message: "success",
            status: true,
            data: client
        })
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.updateClient = async (req, res) => {
    const {
        name,
        address,
        tax_no,
        email,
        code
    } = req.body
    const { id } = req.params
    try {
        const client = await Client.findByIdAndUpdate(id, {
            $set: {
                name: name,
                address: address,
                tax_no: tax_no,
                code: code,
                email: email,
            }
        }, { new: true })
        if (!client) {
            return res.status(404).json({
                message: "not found"
            })
        }

        return res.status(201).json({
            message: "success",
            status: true,
            data: client
        })
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.getClient = async (req, res) => {
    const { id } = req.params
    try {
        const client = await Client.findById(id)
        if (!client) {
            return res.status(404).json({
                message: "not found"
            })
        }

        return res.status(200).json({
            message: "success",
            status: true,
            data: client
        })
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.getClients = async (req, res) => {
    try {
        const clients = await Client.find()

        return res.status(200).json({
            message: "success",
            status: true,
            data: clients
        })
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.deleteClient = async (req, res) => {
    const { id } = req.params
    try {
        const client = await Client.findByIdAndDelete(id)
        if (!client) {
            return res.status(404).json({
                message: "not found"
            })
        }

        return res.status(200).json({
            message: "success",
            status: true,
        })
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}