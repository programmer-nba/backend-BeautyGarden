const dayjs = require("dayjs")
const QuotationVat = require("../../models/order/quotationVat_model")
const InvoiceVat = require("../../models/order/invoiceVat_model")
const ReceiptVat = require("../../models/order/receiptVat_model")

exports.quotationVatAmount = async (req, res) => {
    const { period } = req.query
    try {
        let quotationAmount = 0
        let total_net = 0
        let total_vat = 0
        let total_withholding = 0

        const startOfMonth = dayjs().startOf('month').toISOString();
        const endOfMonth = dayjs().endOf('month').toISOString();
        if (period === 'currentMonth') {
            const rawDocs = await QuotationVat.find(
                {
                    date: {
                        $gte: startOfMonth,
                        $lte: endOfMonth
                    }
                }
            ).select('-products -__v')
            const quotations = rawDocs.filter(qt => qt.status[qt.status?.length-1]?.name !== 'hide')
            quotationAmount = quotations.length

            const total_net_list = quotations.map(item => item.summary.find(s => s.id === '_6')?.value )
            total_net = total_net_list.reduce((a, b) => a + b, 0)

            const total_vat_list = quotations.map(item => item.summary.find(s => s.id === '_4')?.value )
            total_vat = total_vat_list.reduce((a, b) => a + b, 0)

            const total_withholding_list = quotations.map(item => item.withholding_price)
            total_withholding = total_withholding_list.reduce((a, b) => a + b, 0)
        } else {
            const rawDocs = await QuotationVat.find().select('-products -__v')
            const quotations = rawDocs.filter(qt => qt.status[qt.status?.length-1]?.name !== 'hide')
            quotationAmount = quotations.length

            const total_net_list = quotations.map(item => item.summary.find(s => s.id === '_6')?.value )
            total_net = total_net_list.reduce((a, b) => a + b, 0)

            const total_vat_list = quotations.map(item => item.summary.find(s => s.id === '_4')?.value )
            total_vat = total_vat_list.reduce((a, b) => a + b, 0)

            const total_withholding_list = quotations.map(item => item.withholding_price)
            total_withholding = total_withholding_list.reduce((a, b) => a + b, 0)
        }

        return res.status(200).json({ 
            status: true, 
            data: {
                amount: quotationAmount,
                total_net: total_net,
                total_vat: total_vat,
                total_withholding: total_withholding
            }, 
            ref: {
                gte: dayjs(startOfMonth).format("DD/MM/YYYY"),
                lte: dayjs(endOfMonth).format("DD/MM/YYYY")
            },
            query: req.query
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({ message: err.message })
    }
}

exports.invoiceVatAmount = async (req, res) => {
    const { period } = req.query
    try {
        let invoiceAmount = 0
        let total_net = 0
        let total_vat = 0
        let total_withholding = 0

        const startOfMonth = dayjs().startOf('month').toISOString();
        const endOfMonth = dayjs().endOf('month').toISOString();
        if (period === 'currentMonth') {
            const rawDocs = await InvoiceVat.find(
                {
                    date: {
                        $gte: startOfMonth,
                        $lte: endOfMonth
                    }
                }
            ).select('-products -__v')
            const invoices = rawDocs.filter(qt => qt.status[qt.status?.length-1]?.name !== 'hide')
            invoiceAmount = invoices.length

            const total_net_list = invoices.map(item => item.summary.find(s => s.id === '_6')?.value )
            total_net = total_net_list.reduce((a, b) => a + b, 0)

            const total_vat_list = invoices.map(item => item.summary.find(s => s.id === '_4')?.value )
            total_vat = total_vat_list.reduce((a, b) => a + b, 0)

            const total_withholding_list = invoices.map(item => item.withholding_price)
            total_withholding = total_withholding_list.reduce((a, b) => a + b, 0)
        } else {
            const rawDocs = await InvoiceVat.find().select('-products -__v')
            const invoices = rawDocs.filter(qt => qt.status[qt.status?.length-1]?.name !== 'hide')
            invoiceAmount = invoices.length

            const total_net_list = invoices.map(item => item.summary.find(s => s.id === '_6')?.value )
            total_net = total_net_list.reduce((a, b) => a + b, 0)

            const total_vat_list = invoices.map(item => item.summary.find(s => s.id === '_4')?.value )
            total_vat = total_vat_list.reduce((a, b) => a + b, 0)

            const total_withholding_list = invoices.map(item => item.withholding_price)
            total_withholding = total_withholding_list.reduce((a, b) => a + b, 0)
        }

        return res.status(200).json({ 
            status: true, 
            data: {
                amount: invoiceAmount,
                total_net: total_net,
                total_vat: total_vat,
                total_withholding: total_withholding
            }, 
            ref: {
                gte: dayjs(startOfMonth).format("DD/MM/YYYY"),
                lte: dayjs(endOfMonth).format("DD/MM/YYYY")
            },
            query: req.query
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({ message: err.message })
    }
}

exports.receiptVatAmount = async (req, res) => {
    const { period } = req.query
    try {
        let receiptAmount = 0
        let total_net = 0
        let total_vat = 0
        let total_withholding = 0

        const startOfMonth = dayjs().startOf('month').toISOString();
        const endOfMonth = dayjs().endOf('month').toISOString();
        if (period === 'currentMonth') {
            const rawDocs = await ReceiptVat.find(
                {
                    date: {
                        $gte: startOfMonth,
                        $lte: endOfMonth
                    }
                }
            ).select('-products -__v')
            const receipts = rawDocs.filter(qt => qt.status[qt.status?.length-1]?.name !== 'hide')
            receiptAmount = receipts.length

            const total_net_list = receipts.map(item => item.summary.find(s => s.id === '_6')?.value )
            total_net = total_net_list.reduce((a, b) => a + b, 0)

            const total_vat_list = receipts.map(item => item.summary.find(s => s.id === '_4')?.value )
            total_vat = total_vat_list.reduce((a, b) => a + b, 0)

            const total_withholding_list = receipts.map(item => item.withholding_price)
            total_withholding = total_withholding_list.reduce((a, b) => a + b, 0)
        } else {
            const rawDocs = await ReceiptVat.find().select('-products -__v')
            const receipts = rawDocs.filter(qt => qt.status[qt.status?.length-1]?.name !== 'hide')
            receiptAmount = receipts.length

            const total_net_list = receipts.map(item => item.summary.find(s => s.id === '_6')?.value )
            total_net = total_net_list.reduce((a, b) => a + b, 0)

            const total_vat_list = receipts.map(item => item.summary.find(s => s.id === '_4')?.value )
            total_vat = total_vat_list.reduce((a, b) => a + b, 0)

            const total_withholding_list = receipts.map(item => item.withholding_price)
            total_withholding = total_withholding_list.reduce((a, b) => a + b, 0)
        }

        return res.status(200).json({ 
            status: true, 
            data: {
                amount: receiptAmount,
                total_net: total_net,
                total_vat: total_vat,
                total_withholding: total_withholding
            }, 
            ref: {
                gte: dayjs(startOfMonth).format("DD/MM/YYYY"),
                lte: dayjs(endOfMonth).format("DD/MM/YYYY")
            },
            query: req.query
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({ message: err.message })
    }
}