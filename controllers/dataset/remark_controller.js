const Remark = require("../../models/dataset/remark_model")

exports.createRemark = async (req, res) => {
    const { name, value } = req.body
    try {
        const remark = await Remark.create({
            name,
            value
        })
        return res.status(201).json({
            message: "success",
            status: true,
            data: remark
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}


exports.getRemarks = async (req, res) => {
    try {
        const remarks = await Remark.find()
        return res.status(200).json({
            message: "success",
            status: true,
            data: remarks
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.getRemark = async (req, res) => {
    const { id } = req.params
    try {
        const remark = await Remark.findById(id)
        if (!remark) {
            return res.status(404).json({
                message: "data not found"
            })
        }

        return res.status(200).json({
            message: "success",
            status: true,
            data: remark
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}


exports.updateRemark = async (req, res) => {
    const { name, value } = req.body
    const { id } = req.params
    try {
        const remark = await Remark.findByIdAndUpdate(id, {
            $set: {
                name: name,
                value: value
            }
        }, { new: true })
        if (!remark) {
            return res.status(404).json({
                message: "data not found"
            })
        }

        return res.status(201).json({
            message: "success",
            status: true,
            data: remark
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}


exports.deleteRemark = async (req, res) => {
    const { id } = req.params
    try {
        const remark = await Remark.findByIdAndDelete(id)
        if (!remark) {
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