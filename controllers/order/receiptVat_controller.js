const ReceiptVat = require("../../models/order/receiptVat_model")
const dayjs = require("dayjs")
const buddhistEra = require("dayjs/plugin/buddhistEra");
dayjs.extend(buddhistEra);

function padString(value, targetLength, padChar = '0') {
    return value.toString().padStart(targetLength, padChar);
}

exports.getNextReceiptVatNo = async (req, res) => {
    try {
        const targetDate = dayjs(new Date()).format("BBMM")
        const allReceiptVats = await ReceiptVat.find()
        const activeDocs = allReceiptVats.filter(doc => doc.status[doc.status?.length-1]?.name !== 'hide')
        const sameDateDocs = activeDocs.filter(doc => doc.no.slice(2, 6) === targetDate)
        const lastDoc = sameDateDocs[sameDateDocs.length-1]
        const lastNum = parseInt(lastDoc?.no?.slice(-3))
        const no = "RE" + targetDate + padString(lastNum+1, 3)
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

const getReceiptVatNo = async (date) => {
    if (!date) return false
    try {
        const targetDate = dayjs(new Date(date)).format("BBMM")
        const allReceiptVats = await ReceiptVat.find()
        const activeDocs = allReceiptVats.filter(doc => doc.status[doc.status?.length-1]?.name !== 'hide')
        const sameDateDocs = activeDocs.filter(doc => doc.no.slice(2, 6) === targetDate)
        const lastDoc = sameDateDocs[sameDateDocs.length-1]
        const lastNum = parseInt(lastDoc?.no?.slice(-3))
        const no = "RE" + targetDate + padString(lastNum+1, 3)
        return no
    }
    catch(err) {
        //console.log(err)
        return false
    }
}

exports.createReceiptVat = async (req, res) => {
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
        const no = await getReceiptVatNo(date)
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
        const receiptVat = await ReceiptVat.create(newData)
        if (!receiptVat) {
            return res.status(400).json({
                message: "can not create data"
            })
        }

        return res.status(200).json({
            message: "success",
            status: true,
            data: receiptVat
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.updateReceiptVat = async (req, res) => {
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
        const existreceiptVat = await ReceiptVat.findById(id)
        if (!existreceiptVat) {
            return res.status(404).json({
                message: "data not found"
            })
        }
        const receiptVat = await ReceiptVat.findByIdAndUpdate(id, {
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
                status: { name: status || existreceiptVat.status[existreceiptVat.status.length-1].name, createdAt: new Date() },
                refer: refer
            }
        }, { new: true })

        return res.status(201).json({
            message: "success",
            status: true,
            data: receiptVat
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.getReceiptVat = async (req, res) => {
    const { id } = req.params
    try {
        const receiptVat = await ReceiptVat.findById(id)
        if (!receiptVat) {
            return res.status(404).json({
                message: "data not found"
            })
        }

        return res.status(200).json({
            message: "success",
            status: true,
            data: receiptVat
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.getReceiptsVat = async (req, res) => {
    const { order } = req.query
    try {
        let receiptVats = []
        if (order) {
            receiptVats = await ReceiptVat.aggregate([
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
            receiptVats = await ReceiptVat.aggregate([
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
            data: receiptVats
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.getReceiptsVatHide = async (req, res) => {
    try {
        const receiptVats = await ReceiptVat.aggregate([
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
            data: receiptVats
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.getReceiptsVatAll = async (req, res) => {
    const { order } = req.query
    try {
        let receiptVats = []
        if (order) {
            receiptVats = await ReceiptVat.find({ order: order })
        } else {
            receiptVats = await ReceiptVat.find()
        }
        return res.status(200).json({
            message: "success",
            status: true,
            data: receiptVats
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.deleteReceiptVat = async (req, res) => {
    const { id } = req.params
    try {
        const receiptVat = await ReceiptVat.findByIdAndDelete(id)
        if (!receiptVat) {
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