const QuotationVat = require("../../models/order/quotationVat_model")
const dayjs = require("dayjs")
const buddhistEra = require("dayjs/plugin/buddhistEra");
dayjs.extend(buddhistEra);

function padString(value, targetLength, padChar = '0') {
    return value.toString().padStart(targetLength, padChar);
}

exports.getNextQuotationVatNo = async (req, res) => {
    try {
        const targetDate = dayjs(new Date()).format("BBMM")
        const allQuotationVats = await QuotationVat.find()
        const activeDocs = allQuotationVats.filter(doc => doc.status[doc.status?.length-1]?.name !== 'hide')
        const sameDateDocs = activeDocs.filter(doc => doc.no.slice(2, 6) === targetDate)
        const lastDoc = sameDateDocs[sameDateDocs.length-1]
        const lastNum = parseInt(lastDoc?.no?.slice(-3))
        const no = "QT" + targetDate + padString(lastNum+1, 3)
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

const getQuotationVatNo = async (date) => {
    if (!date) return false
    try {
        const targetDate = dayjs(new Date(date)).format("BBMM")
        const allQuotationVats = await QuotationVat.find({doc_type: {$ne: 'งวดย่อย'}})
        const activeDocs = allQuotationVats.filter(doc => doc.status[doc.status?.length-1]?.name !== 'hide')
        const sameDateDocs = activeDocs.filter(doc => doc.no.slice(2, 6) === targetDate)
        const lastDoc = sameDateDocs[sameDateDocs.length-1]
        const lastNum = lastDoc?.no ? parseInt(lastDoc?.no?.slice(-3)) : 0
        const no = "QT" + targetDate + padString(lastNum+1, 3)
        return no
    }
    catch(err) {
        //console.log(err)
        return false
    }
}

exports.predictNo = async (req, res) => {
    const { date } = req.body
    const no = await getQuotationVatNo(date)
    return res.status(200).json({
        status: true,
        data: no
    })
}

exports.createQuotationVat = async (req, res) => {
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
        dueDateChecked
    } = req.body
    try {
        //const currentDate = dayjs(new Date()).format("BBMM")
        //const allQuotationVats = await QuotationVat.find()
        const no = await getQuotationVatNo(date)
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
            status: [ { name: "pending", createdAt: new Date() } ]
        }
        const quotationVat = await QuotationVat.create(newData)
        if (!quotationVat) {
            return res.status(400).json({
                message: "can not create data"
            })
        }

        return res.status(200).json({
            message: "success",
            status: true,
            data: quotationVat
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.updateQuotationVat = async (req, res) => {
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
        refer
    } = req.body
    const { id } = req.params
    try {
        const existquotationVat = await QuotationVat.findById(id)
        if (!existquotationVat) {
            return res.status(404).json({
                message: "data not found"
            })
        }
        const quotationVat = await QuotationVat.findByIdAndUpdate(id, {
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
            },
            $push: {
                status: { name: status || existquotationVat.status[existquotationVat.status.length-1].name, createdAt: new Date() },
                refer: refer
            }
        }, { new: true })

        return res.status(201).json({
            message: "success",
            status: true,
            data: quotationVat
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.getQuotationVat = async (req, res) => {
    const { id } = req.params
    try {
        const quotationVat = await QuotationVat.findById(id)
        if (!quotationVat) {
            return res.status(404).json({
                message: "data not found"
            })
        }

        return res.status(200).json({
            message: "success",
            status: true,
            data: quotationVat
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.getQuotationsVat = async (req, res) => {
    const { order } = req.query
    try {
        let quotationVats = []
        if (order) {
            quotationVats = await QuotationVat.aggregate([
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
            quotationVats = await QuotationVat.aggregate([
                {
                  // Add a field to store the last status
                  $addFields: {
                    lastStatus: { $arrayElemAt: ['$status', -1] } // Get the last element of the 'status' array
                  }
                },
                {
                  // Filter documents where the last status is not 'hide'
                  $match: {
                    'lastStatus.name': { $ne: 'hide' } // Match where last status name is not 'hide'
                  }
                },
                {
                  // Exclude the '__v' and 'products' fields from the results
                  $project: {
                    __v: 0, // Exclude '__v'
                    products: 0 // Exclude 'products'
                  }
                }
              ]);
        }
        return res.status(200).json({
            message: "success",
            status: true,
            data: quotationVats
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.getQuotationsVatHide = async (req, res) => {
    try {
        const quotationVats = await QuotationVat.aggregate([
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
            data: quotationVats
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.getQuotationsVatAll = async (req, res) => {
    const { order } = req.query
    try {
        let quotationVats = []
        if (order) {
            quotationVats = await QuotationVat.find({ order: order })
        } else {
            quotationVats = await QuotationVat.find()
        }
        return res.status(200).json({
            message: "success",
            status: true,
            data: quotationVats
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.deleteQuotationVat = async (req, res) => {
    const { id } = req.params
    try {
        const quotationVat = await QuotationVat.findByIdAndDelete(id)
        if (!quotationVat) {
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