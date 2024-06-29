const Product = require("../../models/order/product_model")

function padString(value, targetLength, padChar = '0') {
    return value.toString().padStart(targetLength, padChar);
}

exports.createProduct = async (req, res) => {
    const {
        name,
        description,
        price,
        unit,
        type
    } = req.body
    try {
        const allProducts = await Product.find()
        const code = "P" + padString(allProducts.length, 4)
        const newData = {
            code: code,
            name: name,
            description: description,
            unit: unit,
            type: type,
            price: price
        }
        const product = await Product.create(newData)
        if (!product) {
            return res.status(400).json({
                message: "can not create data"
            })
        }

        return res.status(200).json({
            message: "created product success",
            status: true,
            data: product
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.updateProduct = async (req, res) => {
    const {
        name,
        description,
        price,
        unit,
        type,
        images,
        code
    } = req.body
    const { id } = req.params
    try {
        const product = await Product.findByIdAndUpdate(id, {
            $set: {
                code: code,
                name: name,
                description: description,
                unit: unit,
                type: type,
                price: price,
                images: images
            }
        }, { new: true })
        if (!product) {
            return res.status(404).json({
                message: "data not found"
            })
        }

        return res.status(201).json({
            message: "success",
            status: true,
            data: product
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.getProduct = async (req, res) => {
    const { id } = req.params
    try {
        const product = await Product.findById(id)
        if (!product) {
            return res.status(404).json({
                message: "data not found"
            })
        }

        return res.status(200).json({
            message: "success",
            status: true,
            data: product
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find()

        return res.status(200).json({
            message: "success",
            status: true,
            data: products
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.deleteProduct = async (req, res) => {
    const { id } = req.params
    try {
        const product = await Product.findByIdAndDelete(id)
        if (!product) {
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

