const mongoose = require("mongoose")
const { Schema } = mongoose

const expenseSchema = new Schema(
    {
        user: { type: String, default: null },
        name: { type: String, require: true },
        detail: { type: String, default: "" },
        type: { type: String, default: "none" },
        amount: { type: Number, default: 0 },
        refer: { type: Object, default: {} }
    },
    {
        timestamps: true
    }
)

const Expense = mongoose.model("Expense", expenseSchema)
module.exports = Expense