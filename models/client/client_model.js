const mongoose = require("mongoose")
const { Schema } = mongoose

const clientSchema = new Schema(
    {
        name: { type: String, require: true },
        code: { type: String, require: true },
        tax_no: { type: String, default: "" },
        address: { type: String, default: "" },
        email: { type: String, default: "" },
    },
    {
        timestamps: true
    }
)

const Client = mongoose.model("Client", clientSchema)
module.exports = Client