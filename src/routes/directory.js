const router = require('express').Router()
const Dir = require('../models/directory')
const File = require('../models/file')
const { Types } = require('mongoose')
const { createResponse, status } = require('../helpers')
const { route } = require('./file')

const getRoot = async (req, res) => {
    const folders = await Dir.find({ parent_id: null })
    const files = await File.find({ parent_id: null }).sort({ created_at: -1 })
    return res.json(createResponse({ folders, files }, '', status.OK))
}

const createDir = async (req, res) => {
    const { name } = req.body
    let { parent } = req.query
    console.log(parent)
    let dir
    if (!parent) {
        dir = await Dir.create({ name })
    } else dir = await Dir.create({ name, parent_id: Types.ObjectId(parent) })
    res.json(
        createResponse(
            { folder: dir },
            'Folder created successfully',
            status.CREATED
        )
    )
}

const getChildren = async (req, res) => {
    const { id } = req.params
    const folders = await Dir.find({ parent_id: id })
    const files = await File.find({ parent_id: id }).sort({ created_at: -1 })
    res.json(createResponse({ folders, files }, '', status.ok))
}

const renameDir = async (req, res) => {
    const { id } = req.params
    const { name } = req.body
    console.log(req.body)
    await Dir.findByIdAndUpdate(id, { $set: { name } })
    res.json(createResponse({}, 'Folder renamed successfully', status.OK))
}

const deleteDir = async (req, res) => {
    const { id } = req.params
    await File.deleteMany({ parent_id: id })
    await Dir.findByIdAndDelete(id)
    res.json(createResponse({}, 'Folder deleted successfully', status.OK))
}

router.get('/', getRoot)
router.post('/new', createDir)
router.get('/:id/children', getChildren)
router.post('/:id/rename', renameDir)
router.delete('/:id', deleteDir)

module.exports = router
