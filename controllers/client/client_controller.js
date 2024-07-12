const Client = require("../../models/client/client_model")

function padString(value, targetLength, padChar = '0') {
    return value.toString().padStart(targetLength, padChar);
}

exports.createClient = async (req, res) => {
    const {
        name,
        tax_no,
        address,
        email,
        map_url,
        contact_person,
        tel,
        contact_person2,
        tel2,
        contact_person3,
        tel3,
        customer_type,
        sign_name,
    } = req.body
    try {
        const allClients = await Client.find()
        const code = "CS" + padString(allClients.length+1, 4)
        const newData = {
            name: name,
            code: code,
            tax_no: tax_no,
            address: address,
            email: email,
            map_url: map_url,
            contact_person: contact_person,
            tel: tel,
            contact_person2: contact_person2,
            tel2: tel2,
            contact_person3: contact_person3,
            tel3: tel3,
            customer_type: customer_type,
            sign_name: sign_name,
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
        code,
        tax_no,
        address,
        email,
        map_url,
        contact_person,
        tel,
        contact_person2,
        tel2,
        contact_person3,
        tel3,
        customer_type,
        sign_name,
    } = req.body
    const { id } = req.params
    try {
        const client = await Client.findByIdAndUpdate(id, {
            $set: {
                name: name,
                code: code,
                tax_no: tax_no,
                address: address,
                email: email,
                map_url: map_url,
                contact_person: contact_person,
                tel: tel,
                contact_person2: contact_person2,
                tel2: tel2,
                contact_person3: contact_person3,
                tel3: tel3,
                customer_type: customer_type,
                sign_name: sign_name,
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