const QuotationNoVat = require("../../models/order/quotationNoVat_model")
const dayjs = require("dayjs")
const buddhistEra = require("dayjs/plugin/buddhistEra");
dayjs.extend(buddhistEra);

function padString(value, targetLength, padChar = '0') {
    return value.toString().padStart(targetLength, padChar);
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
        header,
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
        no
    } = req.body
    const { id } = req.params
    try {
        const quotationNoVat = await QuotationNoVat.findByIdAndUpdate(id, {
            $set: {
                no: no,
                order: order,
                customer: customer,
                products: products,
                header: header,
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
            }
        }, { new: true })
        if (!quotationNoVat) {
            return res.status(404).json({
                message: "data not found"
            })
        }

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