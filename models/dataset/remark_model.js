const mongoose = require("mongoose")
const { Schema } = mongoose

const remarkSchema = new Schema(
    {
        name: { type: String, require: true },
        value: { type: String, default: "" }
    },
    {
        timestamps: true
    }
)

const Remark = mongoose.model("_remark", remarkSchema)
module.exports = Remark