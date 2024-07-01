const mongoose = require("mongoose")
const { Schema } = mongoose

const clientSchema = new Schema(
    {
        name: { type: String, require: true },
        code: { type: String, require: true },
        tax_no: { type: String, default: "" },
        address: { type: String, default: "" },
        email: { type: String, default: "" },
        map_url: { type: String, default: "" },
        contact_person: { type: String, default: "" },
        tel: { type: String, default: "" },
        customer_type: { type: String, default: "" },
        sign_name: { type: String, default: "" },
    },
    {
        timestamps: true
    }
)

const Client = mongoose.model("Client", clientSchema)
module.exports = Client