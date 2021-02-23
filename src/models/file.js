const { Schema, model } = require('mongoose')

const schema = new Schema({
    parent_id: {
        type: Schema.Types.ObjectId,
        default: null,
    },
    name: String,
    format: String,
    size: Number,
    dimenX: Number,
    dimenY: Number,
})

module.exports = model('file', schema)
