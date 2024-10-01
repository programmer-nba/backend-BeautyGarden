const InvoiceNoVat = require("../../models/order/invoiceNoVat_model")
const ReceiptNoVat = require("../../models/order/receiptNoVat_model")
const dayjs = require("dayjs")
const buddhistEra = require("dayjs/plugin/buddhistEra");
dayjs.extend(buddhistEra);

function padString(value, targetLength, padChar = '0') {
    return value.toString().padStart(targetLength, padChar);
}

exports.getNextInvoiceNoVatNo = async (req, res) => {
    try {
        const targetDate = dayjs(new Date()).format("BBMM")
        const allInvoiceNoVats = await InvoiceNoVat.find()
        const activeDocs = allInvoiceNoVats.filter(doc => doc.status[doc.status?.length-1]?.name !== 'hide')
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

const getInvoiceNoVatNo = async (date) => {
    if (!date) return false
    try {
        const targetDate = dayjs(new Date(date)).format("BBMM")
        const allInvoiceNoVats = await InvoiceNoVat.find()
        const activeDocs = allInvoiceNoVats.filter(doc => doc.status[doc.status?.length-1]?.name !== 'hide')
        const sameDateDocs = activeDocs.filter(doc => doc.no.slice(2, 6) === targetDate)
        const lastDoc = sameDateDocs[sameDateDocs.length-1]
        const lastNum = parseInt(lastDoc?.no?.slice(-3))
        const no = "IN" + targetDate + padString(lastNum+1, 3)
        return no
    }
    catch(err) {
        //console.log(err)
        return false
    }
}

exports.createInvoiceNoVat = async (req, res) => {
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
        //const allInvoiceNoVats = await InvoiceNoVat.find()
        const no = await getInvoiceNoVatNo(date)
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
        const invoiceNoVat = await InvoiceNoVat.create(newData)
        if (!invoiceNoVat) {
            return res.status(400).json({
                message: "can not create data"
            })
        }

        return res.status(200).json({
            message: "success",
            status: true,
            data: invoiceNoVat
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.updateInvoiceNoVat = async (req, res) => {
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
        const existinvoiceNoVat = await InvoiceNoVat.findById(id)
        if (!existinvoiceNoVat) {
            return res.status(404).json({
                message: "data not found"
            })
        }
        const invoiceNoVat = await InvoiceNoVat.findByIdAndUpdate(id, {
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
                subPeriod:subPeriod
            },
            $push: {
                status: { name: status || existinvoiceNoVat.status[existinvoiceNoVat.status.length-1].name, createdAt: new Date() },
                refer: refer
            }
        }, { new: true })

        return res.status(201).json({
            message: "success",
            status: true,
            data: invoiceNoVat
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.getInvoiceNoVat = async (req, res) => {
    const { id } = req.params
    try {
        const invoiceNoVat = await InvoiceNoVat.findById(id)
        if (!invoiceNoVat) {
            return res.status(404).json({
                message: "data not found"
            })
        }

        return res.status(200).json({
            message: "success",
            status: true,
            data: invoiceNoVat
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.getInvoicesNoVat = async (req, res) => {
    const { order } = req.query
    try {
        let invoiceNoVats = []
        if (order) {
            invoiceNoVats = await InvoiceNoVat.aggregate([
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
            invoiceNoVats = await InvoiceNoVat.aggregate([
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
            data: invoiceNoVats
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.getInvoicesNoVatHide = async (req, res) => {
    try {
        const invoiceNoVats = await InvoiceNoVat.aggregate([
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
            data: invoiceNoVats
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.getInvoicesNoVatAll = async (req, res) => {
    const { order } = req.query
    try {
        let invoiceNoVats = []
        if (order) {
            invoiceNoVats = await InvoiceNoVat.find({ order: order })
        } else {
            invoiceNoVats = await InvoiceNoVat.find()
        }
        return res.status(200).json({
            message: "success",
            status: true,
            data: invoiceNoVats
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.deleteInvoiceNoVat = async (req, res) => {
    const { id } = req.params
    try {
        const invoiceNoVat = await InvoiceNoVat.findByIdAndDelete(id)
        if (!invoiceNoVat) {
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
        const invoice = await InvoiceNoVat.findById(id)
        if (!invoice) {
            return res.status(404).json({
                message: "not found"
            })
        }
        const receipt = await ReceiptNoVat.findOne({ 'refer.refer_id': id }).sort({ createdAt: -1 })
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