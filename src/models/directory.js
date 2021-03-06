const { Schema, model } = require('mongoose')

const schema = new Schema(
    {
        name: String,
        parent_id: {
            type: Schema.Types.ObjectId,
            default: null,
        },
        size: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
)

module.exports = model('Directory', schema)
