const router = require('express').Router()
const Dir = require('../models/directory')
const { Types } = require('mongoose')

const getRoot = async (req, res) => {
    const data = await Dir.find({ parent_id: null })
    console.log(data)
    return res.json(data)
}

const createDir = async (req, res) => {
    const { name } = req.body
    let { parent } = req.query
    console.log(parent)
    if (!parent) {
        await Dir.create({ name })
    } else await Dir.create({ name, parent_id: Types.ObjectId(parent) })
    res.json({ success: true })
}

const renameDir = async (req, res) => {
    const { id } = req.params
    const { name } = req.body
    await Dir.findByIdAndUpdate(id, { $set: { name } })
    res.json({ success: true })
}

router.get('/', getRoot)
router.post('/new', createDir)
router.post('/:id/rename', renameDir)

module.exports = router
