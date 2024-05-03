const Project = require('../../models/admin/project.model')

exports.createProject = async (req, res) => {
    const {
        header,
        customer,
        detail,
        remark,
        suggest,
        signature
    } = req.body

    if (!header || !customer) {
        return res.status(404).json({
            message: "กรุณาส่งข้อมูล header และ customer มาด้วย"
        })
    }

    try {
        const project = {
            header: header,
            customer: customer,
            detail: {
                location: detail?.location,
                locationMap: detail?.locationMap,
                startDate: detail?.startDate,
                durationDay: detail?.durationDay,
                time: detail?.time,
            },
            remark: remark,
            suggest: suggest,
            signature: signature
        }
        const new_project = new Project(project)
        const saved_project = await new_project.save()
        if (!saved_project) {
            return res.status(500).json({
                message: "ไม่สามารถ save project ได้",
            })
        }

        return res.status(200).json({
            message: "เพิ่มข้อมูลสำเร็จ",
            status: true,
            data: saved_project
        })
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.updateProject = async (req, res) => {
    const {
        header,
        customer,
        detail,
        remark,
        suggest,
        signature
    } = req.body

    const { id } = req.params

    let project = await Project.findById( id )
    if (!project) {
        return res.status(404).json({
            message: "not found project id"
        })
    }

    try {
        const new_project = {
            header: header || project.header,
            customer: customer || project.customer,
            detail: {
                location: detail?.location || project.detail?.location,
                locationMap: detail?.locationMap || project.detail?.locationMap,
                startDate: detail?.startDat || project.detail?.startDat,
                durationDay: detail?.durationDay || project.detail?.durationDay,
                time: detail?.time || project.detail?.time,
            },
            remark: remark || project.remark,
            suggest: suggest || project.suggest,
            signature: signature || project.signature
        }

        project = new_project
        const saved_project = await project.save()
        if (!saved_project) {
            return res.status(500).json({
                message: "ไม่สามารถ save project ได้",
            })
        }

        return res.status(200).json({
            message: "success",
            status: true,
            data: saved_project
        })
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.getProjects = async (req, res) => {
    try {
        const projects = await Project.find()

        return res.status(200).json({
            message: "success",
            status: true,
            data: projects
        })
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.getProject = async (req, res) => {
    const { id } = req.params
    try {
        const project = await Project.findById( id )
        if (!project) {
            return res.status(404).json({
                message: "not found"
            })
        }

        return res.status(200).json({
            message: "success",
            status: true,
            data: project
        })
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.deleteProject = async (req, res) => {
    const { id } = req.params
    try {
        const project = await Project.findByIdAndDelete( id )
        if (!project) {
            return res.status(404).json({
                message: "not found"
            })
        }

        return res.status(200).json({
            message: "success deleted!",
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

exports.deleteProjects = async (req, res) => {
    try {
        const projects = await Project.deleteMany()

        return res.status(200).json({
            message: "success deleted!",
            status: true,
            data: projects.deletedCount
        })
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({
            message: err.message
        })
    }
}