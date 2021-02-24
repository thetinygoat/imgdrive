const { Schema, model } = require('mongoose')

const schema = new Schema(
    {
        parent_id: {
            type: Schema.Types.ObjectId,
            default: null,
        },
        name: String,
        format: String,
        size: Number,
        width: Number,
        height: Number,
    },
    { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
)

module.exports = model('file', schema)
