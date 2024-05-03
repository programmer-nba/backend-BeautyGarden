const mongoose = require("mongoose")
const { Schema } = mongoose

const projectSchema = new Schema(
    {
        header: {
            type: String,
            require: true
        },
        customer: {
            type: String,
            require: true
        },
        detail: {
            location: { type: String, default: null },
            locationMap: { type: String, default: null },
            startDate: { type: Date, default: null },
            durationDay: { type: Number, default: null },
            time: { type: Date, default: null },
        },
        remark: {
            type: String,
            default: ""
        },
        suggest: {
            type: Array,
            default: []
        },
        signature: {
            type: Array,
            default: []
        }
    },
    {
        timestamps: true
    }
)

const Project = mongoose.model("Project", projectSchema)
module.exports = Project