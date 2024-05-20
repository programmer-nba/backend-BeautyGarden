const mongoose = require('mongoose')
const { Schema } = mongoose

const picture64Schema = new Schema({
    base64: { type: String, require: true },
    refId: { type: String, require: true },
})

const Picture64 = mongoose.model( 'Picture64', picture64Schema )
module.exports = Picture64