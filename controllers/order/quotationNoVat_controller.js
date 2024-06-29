const QuotationNoVat = require("../../models/order/quotationNoVat_model")
const dayjs = require("dayjs")
const buddhistEra = require("dayjs/plugin/buddhistEra");
dayjs.extend(buddhistEra);

function padString(value, targetLength, padChar = '0') {
    return value.toString().padStart(targetLength, padChar);
}

exports.getNextQuotationNoVatNo = async (req, res) => {
    try {
        const currentDate = dayjs(new Date()).format("BBMM")
        const allQuotationVats = await QuotationNoVat.find()
        const no = "QT" + currentDate + padString(allQuotationVats.length, 3)
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

exports.createQuotationNoVat = async (req, res) => {
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
        dueDateChecked,
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
    } = req.body
    try {
        const currentDate = dayjs(new Date()).format("BBMM")
        const allQuotationNoVats = await QuotationNoVat.find()
        const no = "QT" + currentDate + padString(allQuotationNoVats.length, 3)
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
            status: [{ name: "pending", createdAt: new Date() }]
        }
        const quotationNoVat = await QuotationNoVat.create(newData)
        if (!quotationNoVat) {
            return res.status(400).json({
                message: "can not create data"
            })
        }

        return res.status(200).json({
            message: "success",
            status: true,
            data: quotationNoVat
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.updateQuotationNoVat = async (req, res) => {
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
        dueDateChecked,
        payment_term,
        credit,
        remark,
        payment,
        color,
        doc_type,
        signation,
        no,
        isWithholding,
        withholding_percent,
        withholding_price,
        status
    } = req.body
    const { id } = req.params
    try {
        const existquotationNoVat = await QuotationNoVat.findById(id)
        if (!existquotationNoVat) {
            return res.status(404).json({
                message: "data not found"
            })
        }
        const quotationNoVat = await QuotationNoVat.findByIdAndUpdate(id, {
            $set: {
                no: no,
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
            },
            $push: {
                status: { name: status || existquotationNoVat.status[existquotationNoVat.status.length-1].name, createdAt: new Date() }
            }
        }, { new: true })

        return res.status(201).json({
            message: "success",
            status: true,
            data: quotationNoVat
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.getQuotationNoVat = async (req, res) => {
    const { id } = req.params
    try {
        const quotationNoVat = await QuotationNoVat.findById(id)
        if (!quotationNoVat) {
            return res.status(404).json({
                message: "data not found"
            })
        }

        return res.status(200).json({
            message: "success",
            status: true,
            data: quotationNoVat
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.getQuotationsNoVat = async (req, res) => {
    const { order } = req.query
    try {
        let quotationNoVats = []
        if (order) {
            quotationNoVats = await QuotationNoVat.find({ order: order })
        } else {
            quotationNoVats = await QuotationNoVat.find()
        }
        return res.status(200).json({
            message: "success",
            status: true,
            data: quotationNoVats
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.deleteQuotationNoVat = async (req, res) => {
    const { id } = req.params
    try {
        const quotationNoVat = await QuotationNoVat.findByIdAndDelete(id)
        if (!quotationNoVat) {
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