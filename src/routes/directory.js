const router = require('express').Router()
const Dir = require('../models/directory')
const File = require('../models/file')
const { Types } = require('mongoose')
const { createResponse, status } = require('../helpers')

const getRoot = async (req, res) => {
    const folders = await Dir.find({ parent_id: null })
    const files = await File.find({ parent_id: null }).sort({ created_at: -1 })
    return res.json(createResponse({ folders, files }, '', status.OK))
}

const createDir = async (req, res) => {
    const { name } = req.body
    let { parent } = req.query
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
    await Dir.findByIdAndUpdate(id, { $set: { name } })
    res.json(createResponse({}, 'Folder renamed successfully', status.OK))
}

const deleteDirWithChildren = async (id) => {
    await File.deleteMany({ parent_id: Types.ObjectId(id) })
    await Dir.findByIdAndDelete(Types.ObjectId(id))
}

const deleteDir = async (req, res) => {
    const { id } = req.params
    const aggr = Dir.aggregate([
        {
            $graphLookup: {
                from: 'directories',
                startWith: '$_id',
                connectFromField: '_id',
                connectToField: 'parent_id',
                as: 'children',
            },
        },
        { $match: { _id: Types.ObjectId(id) } },
    ])
    // delete children
    aggr.exec((err, result) => {
        if (err) {
            return res.json(
                createResponse(
                    {},
                    'Error deleting folder',
                    status.INTERNAL_SERVER_ERROR,
                    { trace: err }
                )
            )
        } else {
            const doc = result[0]
            doc.children.map(async (c) => {
                await deleteDirWithChildren(c._id)
            })
        }
    })
    // delete self
    await deleteDirWithChildren(id)
    return res.json(
        createResponse({}, 'Folder deleted successfully', status.OK)
    )
}

const getFolderSize = async (req, res) => {
    const { id } = req.params
    const aggr = Dir.aggregate([
        {
            $graphLookup: {
                from: 'directories',
                startWith: '$_id',
                connectFromField: '_id',
                connectToField: 'parent_id',
                as: 'children',
            },
        },
        { $match: { _id: Types.ObjectId(id) } },
    ])
    let size = 0
    aggr.exec((err, result) => {
        if (err) {
            return res.json(
                createResponse(
                    {},
                    'Error getting folder size',
                    status.INTERNAL_SERVER_ERROR,
                    { trace: err }
                )
            )
        } else {
            const doc = result[0]
            doc.children.map(async (c) => {
                size += c.size
            })
        }
    })
    Dir.findOne({ _id: Types.ObjectId(id) }).exec((err, result) => {
        if (err) {
            return res.json(
                createResponse(
                    {},
                    'Error getting folder size',
                    status.INTERNAL_SERVER_ERROR,
                    { trace: err }
                )
            )
        } else {
            let newSize = result.size + size
            return res.json(createResponse({ size: newSize }, '', status.OK))
        }
    })
}

router.get('/', getRoot)
router.post('/new', createDir)
router.get('/:id/children', getChildren)
router.post('/:id/rename', renameDir)
router.delete('/:id', deleteDir)
router.get('/:id/size', getFolderSize)

module.exports = router
