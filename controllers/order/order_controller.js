const Order = require("../../models/order/order_model")
const dayjs = require("dayjs")
const buddhistEra = require("dayjs/plugin/buddhistEra");
dayjs.extend(buddhistEra);

function padString(value, targetLength, padChar = '0') {
    return value.toString().padStart(targetLength, padChar);
}

exports.createOrder = async (req, res) => {
    const {
        customer,
        products,
        header,
        products_price,
        net_price,
        vat_price,
        discount,
        withholding_price
    } = req.body
    try {
        const currentDate = dayjs(new Date()).format("BBMM")
        const allOrders = await Order.find()
        const no = "SSGD" + currentDate + padString(allOrders.length, 3)
        const newData = {
            no: no,
            customer: customer, // _id
            products: products, // [_id]
            header: header, // _id
            products_price: products_price,
            net_price: net_price,
            vat_price: vat_price,
            discount: discount,
            withholding_price: withholding_price,
            status: [
                {
                    name: "กำลังดำเนินการ",
                    createdAt: dayjs(new Date()).format("dd/mm/BBBB HH:mm")
                }
            ],
        }
        const order = await Order.create(newData)
        if (!order) {
            return res.status(400).json({
                message: "can not create data"
            })
        }

        return res.status(200).json({
            message: "success",
            status: true,
            data: order
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.updateOrder = async (req, res) => {
    const {
        customer,
        products,
        header,
        products_price,
        net_price,
        vat_price,
        discount,
        withholding_price,
        no,
    } = req.body
    const { id } = req.params
    try {
        const order = await Order.findByIdAndUpdate(id, {
            $set: {
                no: no,
                customer: customer,
                products: products,
                header: header,
                products_price: products_price,
                net_price: net_price,
                vat_price: vat_price,
                discount: discount,
                withholding_price: withholding_price,
            }
        }, { new: true })
        if (!order) {
            return res.status(404).json({
                message: "data not found"
            })
        }

        return res.status(201).json({
            message: "success",
            status: true,
            data: order
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.updateOrderStatus = async (req, res) => {
    const { status_name } = req.body
    const { id } = req.params
    try {
        const order = await Order.findByIdAndUpdate(id, {
            $push: { 
                status: {
                    name: status_name,
                    createdAt: dayjs(new Date()).format("dd/mm/BBBB HH:mm")
                } 
            }
        }, { new: true })
        if (!order) {
            return res.status(404).json({
                message: "data not found"
            })
        }

        return res.status(201).json({
            message: "success",
            status: true,
            data: order
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.getOrder = async (req, res) => {
    const { id } = req.params
    try {
        const order = await Order.findById(id)
        if (!order) {
            return res.status(404).json({
                message: "data not found"
            })
        }

        return res.status(200).json({
            message: "success",
            status: true,
            data: order
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find()

        return res.status(200).json({
            message: "success",
            status: true,
            data: orders
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.deleteOrder = async (req, res) => {
    const { id } = req.params
    try {
        const order = await Order.findByIdAndDelete(id)
        if (!order) {
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

