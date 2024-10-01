const ReceiptNoVat = require("../../models/order/receiptNoVat_model")
const dayjs = require("dayjs")
const buddhistEra = require("dayjs/plugin/buddhistEra");
dayjs.extend(buddhistEra);

function padString(value, targetLength, padChar = '0') {
    return value.toString().padStart(targetLength, padChar);
}

exports.getNextReceiptNoVatNo = async (req, res) => {
    try {
        const currentDate = dayjs(new Date()).format("BBMM")
        const allReceiptNoVats = await ReceiptNoVat.find()
        const activeDocs = allReceiptNoVats.filter(doc => doc.status[doc.status?.length-1]?.name !== 'hide')
        const lastDoc = activeDocs[activeDocs.length-1]
        const lastNum = parseInt(lastDoc?.no?.slice(-3))
        const no = "RE" + currentDate + padString(lastNum+1, 3)
        return res.status(200).json({
            status: true,
            data: no
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.createReceiptNoVat = async (req, res) => {
    const {
        order,
        customer,
        products,
        summary,
        from,
        head,
        head_eng,
        date,
        due_date,
        payment_term,
        credit,
        remark,
        payment,
        color,
        doc_type,
        signation,
        isWithholding,
        withholding_percent,
        withholding_price,
        dueDateChecked,
        refer,
        subPeriod
    } = req.body
    try {
        const currentDate = dayjs(new Date()).format("BBMM")
        const allReceiptNoVats = await ReceiptNoVat.find()
        const no = "RE" + currentDate + padString(allReceiptNoVats.length+1, 3)
        const newData = {
            order: order,
            customer: customer,
            products: products,
            from: from,
            head: head,
            head_eng: head_eng,
            no : no,
            date: date,
            due_date: due_date,
            dueDateChecked: dueDateChecked,
            payment_term: payment_term,
            credit: credit,
            summary: summary,
            remark: remark,
            payment: payment,
            color: color,
            doc_type: doc_type,
            signation: signation,
            isWithholding: isWithholding,
            withholding_percent: withholding_percent,
            withholding_price: withholding_price,
            status: [ { name: "pending", createdAt: new Date() } ],
            refer: [ refer ],
            subPeriod: subPeriod
        }
        const receiptNoVat = await ReceiptNoVat.create(newData)
        if (!receiptNoVat) {
            return res.status(400).json({
                message: "can not create data"
            })
        }

        return res.status(200).json({
            message: "success",
            status: true,
            data: receiptNoVat
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.updateReceiptNoVat = async (req, res) => {
    const {
        order,
        customer,
        products,
        summary,
        from,
        head,
        head_eng,
        date,
        due_date,
        payment_term,
        credit,
        remark,
        payment,
        color,
        doc_type,
        signation,
        dueDateChecked,
        no,
        isWithholding,
        withholding_percent,
        withholding_price,
        status,
        refer,
        subPeriod
    } = req.body
    const { id } = req.params
    try {
        const existreceiptNoVat = await ReceiptNoVat.findById(id)
        if (!existreceiptNoVat) {
            return res.status(404).json({
                message: "data not found"
            })
        }
        const receiptNoVat = await ReceiptNoVat.findByIdAndUpdate(id, {
            $set: {
                no: no,
                order: order,
                customer: customer,
                products: products,
                frpm: from,
                head: head,
                head_eng: head_eng,
                no : no,
                date: date,
                due_date: due_date,
                dueDateChecked: dueDateChecked,
                payment_term: payment_term,
                credit: credit,
                summary: summary,
                remark: remark,
                payment: payment,
                color: color,
                doc_type: doc_type,
                signation: signation,
                isWithholding: isWithholding,
                withholding_percent: withholding_percent,
                withholding_price: withholding_price,
                subPeriod: subPeriod
            },
            $push: {
                status: { name: status || existreceiptNoVat.status[existreceiptNoVat.status.length-1].name, createdAt: new Date() },
                refer: refer
            }
        }, { new: true })

        return res.status(201).json({
            message: "success",
            status: true,
            data: receiptNoVat
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.getReceiptNoVat = async (req, res) => {
    const { id } = req.params
    try {
        const receiptNoVat = await ReceiptNoVat.findById(id)
        if (!receiptNoVat) {
            return res.status(404).json({
                message: "data not found"
            })
        }

        return res.status(200).json({
            message: "success",
            status: true,
            data: receiptNoVat
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.getReceiptsNoVat = async (req, res) => {
    const { order } = req.query
    try {
        let receiptNoVats = []
        if (order) {
            receiptNoVats = await ReceiptNoVat.aggregate([
                { $match: { order: order } },
                {
                    $addFields: {
                        lastStatus: { $arrayElemAt: ["$status", -1] }
                    }
                },
                {
                    $match: {
                        "lastStatus.name": { $ne: 'hide' }
                    }
                }
            ])
        } else {
            receiptNoVats = await ReceiptNoVat.aggregate([
                {
                    $addFields: {
                        lastStatus: { $arrayElemAt: ["$status", -1] }
                    }
                },
                {
                    $match: {
                        "lastStatus.name": { $ne: 'hide' }
                    }
                }
            ])
        }
        return res.status(200).json({
            message: "success",
            status: true,
            data: receiptNoVats
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.getReceiptsNoVatHide = async (req, res) => {
    try {
        const receiptNoVats = await ReceiptNoVat.aggregate([
            {
                $addFields: {
                    lastStatus: { $arrayElemAt: ["$status", -1] }
                }
            },
            {
                $match: {
                    "lastStatus.name": 'hide'
                }
            }
        ])
        
        return res.status(200).json({
            message: "success",
            status: true,
            data: receiptNoVats
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.getReceiptsNoVatAll = async (req, res) => {
    const { order } = req.query
    try {
        let receiptNoVats = []
        if (order) {
            receiptNoVats = await ReceiptNoVat.find({ order: order })
        } else {
            receiptNoVats = await ReceiptNoVat.find()
        }
        return res.status(200).json({
            message: "success",
            status: true,
            data: receiptNoVats
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.deleteReceiptNoVat = async (req, res) => {
    const { id } = req.params
    try {
        const receiptNoVat = await ReceiptNoVat.findByIdAndDelete(id)
        if (!receiptNoVat) {
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