const mongoose = require("mongoose")
const { Schema } = mongoose

const incomeSchema = new Schema(
    {
        user: { type: String, default: null },
        name: { type: String, require: true },
        detail: { type: String, default: "" },
        type: { type: String, default: "none" },
        amount: { type: Number, default: 0 },
        refer: { type: Object, default: {} },
        date: { type: String, default: new Date() }
    },
    {
        timestamps: true
    }
)

const Income = mongoose.model("Income", incomeSchema)
module.exports = Income