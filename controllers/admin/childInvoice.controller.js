const { Invoice } = require("../../models/admin/invoice.models");
const ChildInvoice = require("../../models/admin/childInvoice.model")

exports.createChildInvoice = async (req, res) => {
    const {
        refInvoice,
        header,
        price,
        start_date,
        end_date,
        remark,
        period
    } = req.body

    try {
        let invoice = await Invoice.findById( refInvoice )
        if (!invoice) {
            return res.status(404).json({
                message: "invoice parent not found!"
            })
        }
        
        //const period = invoice.cur_period ? invoice.cur_period + 1 : 1
        const code = invoice.invoice + "-" + `${period || 1}`

        const data = {
            refInvoice: refInvoice,
            code: code,
            header: header,
            price: price,
            period: period,
            start_date: start_date,
            end_date: end_date,
            remark: remark
        }

        const new_child = new ChildInvoice(data)
        const saved_child = await new_child.save()
        if (!saved_child) {
            return res.status(500).json({
                message: "can not saved!"
            })
        }

        /* const childs = ChildInvoice.find( { refInvoice: refInvoice } )
        const cur_period = invoice.end_period > 1 ? childs.length : 1

        invoice.cur_period = cur_period
        invoice.invoice_period.push({
            child_id: saved_child._id,
            period: period,
            start_date: start_date,
            end_date: end_date,
            price: price
        })

        const saved_invoice = await invoice.save()
        if (!saved_invoice) {
            return res.status(500).json({
                message: "can not saved invoice parent"
            })
        } */

        return res.status(200).json({
            message: "success!",
            status: true,
            data: saved_child
        })
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.updateChildInvoice = async (req, res) => {
    const {
        price,
        start_date,
        end_date,
        remark,
        receipt_ref,
        header,
        period
    } = req.body

    const { id } = req.params

    try {
        let child = await ChildInvoice.findById( id )
        if (!child) {
            return res.status(404).json({
                message: "invoice not found!"
            })
        }

        let invoice = await Invoice.findById( child.refInvoice )
        if (!invoice) {
            return res.status(404).json({
                message: "invoice parent not found!"
            })
        }

        child.price = price || child.price
        child.start_date = start_date || child.start_date
        child.end_date = end_date || child.end_date
        child.remark = remark || child.remark
        child.receipt_ref = receipt_ref || child.receipt_ref
        child.header = header || child.header
        child.period = period || child.period
        
        const saved_child = await child.save()
        if (!saved_child) {
            return res.status(500).json({
                message: "can not saved!"
            })
        }

        const index = invoice.invoice_period.findIndex(val => val.child_id === saved_child._id.toString())
        
        if (index === -1) {
            return res.status(404).json({
                message: "not found invoice_period"
            })
        }

        invoice.invoice_period[index].start_date = saved_child.start_date
        invoice.invoice_period[index].end_date = saved_child.end_date
        invoice.invoice_period[index].price = saved_child.price

        const saved_invoice = await invoice.save()
        if (!saved_invoice) {
            return res.status(500).json({
                message: "can not save invoice parent"
            })
        }

        return res.status(200).json({
            message: "success!",
            status: true,
            data: saved_child
        })
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.getChildInvoices = async (req, res) => {
    try {
        const childs = await ChildInvoice.find()

        return res.status(200).json({
            message: "success!",
            status: true,
            data: childs
        })
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.getChildInvoice = async (req, res) => {
    const { id } = req.params
    try {
        const child = await ChildInvoice.findById( id )
        if(!child) {
            return res.status(404).json({
                message: "not found!"
            })
        }

        return res.status(200).json({
            message: "success!",
            status: true,
            data: child
        })
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.deleteChildInvoice = async (req, res) => {
    const { id } = req.params
    try {
        const child = await ChildInvoice.findById( id )
        if(!child) {
            return res.status(404).json({
                message: "not found!"
            })
        }

        let invoice = await Invoice.findById( child.refInvoice )
        if (!invoice) {
            return res.status(404).json({
                message: "not found"
            })
        }
    
        const deleted_child = await ChildInvoice.findByIdAndDelete( id )
        if(!deleted_child) {
            return res.status(404).json({
                message: "not found!"
            })
        }

        /* const index = invoice.invoice_period.findIndex(val => val.child_id === child._id.toString())
        if (index === -1) {
            return res.status(404).json({
                message: "not found invoice_period"
            })
        }

        invoice.invoice_period.splice(index, 1) */
        //invoice.cur_period > 0 ? invoice.cur_period -= 1 : invoice.cur_period -= 0

        /* const saved_invoice = await invoice.save()
        if (!saved_invoice) {
            return res.status(500).json({
                message: "can not save invoice parent"
            })
        } */

        return res.status(200).json({
            message: "delete success!",
            status: true,
        })
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}