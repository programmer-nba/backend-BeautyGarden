const InvoiceVat = require("../../models/order/invoiceVat_model")
const ReceiptVat = require("../../models/order/receiptVat_model")
const dayjs = require("dayjs")
const buddhistEra = require("dayjs/plugin/buddhistEra");
dayjs.extend(buddhistEra);

function padString(value, targetLength, padChar = '0') {
    return value.toString().padStart(targetLength, padChar);
}

exports.getNextInvoiceVatNo = async (req, res) => {
    try {
        const targetDate = dayjs(new Date()).format("BBMM")
        const allInvoiceVats = await InvoiceVat.find()
        const activeDocs = allInvoiceVats.filter(doc => doc.status[doc.status?.length-1]?.name !== 'hide')
        const sameDateDocs = activeDocs.filter(doc => doc.no.slice(2, 6) === targetDate)
        const lastDoc = sameDateDocs[sameDateDocs.length-1]
        const lastNum = parseInt(lastDoc?.no?.slice(-3))
        const no = "IN" + targetDate + padString(lastNum+1, 3)
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

const getInvoiceVatNo = async (date) => {
    if (!date) return false
    try {
        const targetDate = dayjs(new Date(date)).format("BBMM")
        const allInvoiceVats = await InvoiceVat.find({doc_type: {$ne: 'งวดย่อย'}})
        const activeDocs = allInvoiceVats.filter(doc => doc.status[doc.status?.length-1]?.name !== 'hide')
        const sameDateDocs = activeDocs.filter(doc => doc.no.slice(2, 6) === targetDate)
        const lastDoc = sameDateDocs[sameDateDocs.length-1]
        const lastNum = lastDoc?.no ? parseInt(lastDoc?.no?.slice(-3)) : 0
        const no = "IN" + targetDate + padString(lastNum+1, 3)
        return no
    }
    catch(err) {
        //console.log(err)
        return false
    }
}

exports.predictNo = async (req, res) => {
    const { date } = req.body
    const no = await getInvoiceVatNo(date)
    return res.status(200).json({
        status: true,
        data: no
    })
}

exports.createInvoiceVat = async (req, res) => {
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
        //const currentDate = dayjs(new Date()).format("BBMM")
        //const allInvoiceVats = await InvoiceVat.find()
        const no = await getInvoiceVatNo(date)
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
        const invoiceVat = await InvoiceVat.create(newData)
        if (!invoiceVat) {
            return res.status(400).json({
                message: "can not create data"
            })
        }

        return res.status(200).json({
            message: "success",
            status: true,
            data: invoiceVat
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.updateInvoiceVat = async (req, res) => {
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
        const existinvoiceVat = await InvoiceVat.findById(id)
        if (!existinvoiceVat) {
            return res.status(404).json({
                message: "data not found"
            })
        }
        const invoiceVat = await InvoiceVat.findByIdAndUpdate(id, {
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
                status: { name: status || existinvoiceVat.status[existinvoiceVat.status.length-1].name, createdAt: new Date() },
                refer: refer
            }
        }, { new: true })

        return res.status(201).json({
            message: "success",
            status: true,
            data: invoiceVat
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.getInvoiceVat = async (req, res) => {
    const { id } = req.params
    try {
        const invoiceVat = await InvoiceVat.findById(id)
        if (!invoiceVat) {
            return res.status(404).json({
                message: "data not found"
            })
        }

        return res.status(200).json({
            message: "success",
            status: true,
            data: invoiceVat
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.getInvoicesVat = async (req, res) => {
    const { order } = req.query
    try {
        let invoiceVats = []
        if (order) {
            invoiceVats = await InvoiceVat.aggregate([
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
            invoiceVats = await InvoiceVat.aggregate([
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
            data: invoiceVats
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.getInvoicesVatHide = async (req, res) => {
    try {
        const invoiceVats = await InvoiceVat.aggregate([
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
            data: invoiceVats
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.getInvoicesVatAll = async (req, res) => {
    const { order } = req.query
    try {
        let invoiceVats = []
        if (order) {
            invoiceVats = await InvoiceVat.find({ order: order })
        } else {
            invoiceVats = await InvoiceVat.find()
        }
        return res.status(200).json({
            message: "success",
            status: true,
            data: invoiceVats
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.deleteInvoiceVat = async (req, res) => {
    const { id } = req.params
    try {
        const invoiceVat = await InvoiceVat.findByIdAndDelete(id)
        if (!invoiceVat) {
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

exports.checkPaidStatus = async(req, res) => {
    const { id } = req.params
    try {
        const invoice = await InvoiceVat.findById(id)
        if (!invoice) {
            return res.status(404).json({
                message: "not found"
            })
        }
        const receipt = await ReceiptVat.findOne({ 'refer.refer_id': id }).sort({ createdAt: -1 })
        if (!receipt || receipt?.status[receipt?.status?.length-1]?.name === 'hide') {
            return res.status(200).json({
                data: {
                    status_name: "pending",
                    receipt: {}
                },
                status: true
            })
        }

        return res.status(200).json({
            data: {
                status_name: "paid",
                receipt: {
                    no: receipt.no,
                    date: receipt.date,
                    price: receipt.summary[4]?.show ? receipt.summary[4]?.value : receipt.summary[5]?.show ? receipt.summary[5]?.value : 0,
                    _id: receipt._id
                }
            },
            status: true
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}