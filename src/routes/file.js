const router = require('express').Router()
const formidable = require('formidable')
const sharp = require('sharp')
const File = require('../models/file')
const Dir = require('../models/directory')
const { Types } = require('mongoose')
const { createResponse, status } = require('../helpers')
const file = require('../models/file')

const fileUpload = async (req, res) => {
    const form = new formidable.IncomingForm()
    const { parent } = req.query
    form.parse(req, async (err, _, files) => {
        if (err) {
            return res.json(
                createResponse(
                    {},
                    'Failed to upload file',
                    status.INTERNAL_SERVER_ERROR,
                    {
                        trace: err,
                    }
                )
            )
        }
        const { file } = files
        const { path, name, size } = file

        const image = sharp(path)
        let { format, width, height } = await image.metadata()
        if (format === 'jpeg') format = 'jpg'
        let newFile
        if (parent) {
            newFile = await File.create({
                name,
                format,
                size: size / 1024,
                width,
                height,
                parent_id: Types.ObjectId(parent),
            })
            console.log('size => ', newFile.size)
            await Dir.findByIdAndUpdate(Types.ObjectId(parent), {
                $inc: { size: size / 1024 },
            })
        } else {
            newFile = await File.create({
                name,
                format,
                size: size / 1024,
                width,
                height,
            })
        }
        return res.json(
            createResponse(
                { file: newFile },
                'File uploaded successfully',
                status.CREATED
            )
        )
    })
}

const search = async (req, res) => {
    const { q, format } = req.query
    const pattern = `/^${q}/`
    const regexp = new RegExp(pattern, 'i')
    console.log(regexp)
    let files
    if (format) {
        files = await File.find({
            name: { $regex: `${q}`, $options: 'i' },
            format,
        }).sort({ created_at: -1 })
    } else {
        files = await File.find({
            name: { $regex: `${q}`, $options: 'i' },
        }).sort({ created_at: -1 })
    }

    return res.json(createResponse({ files }, '', status.OK))
}
router.post('/upload', fileUpload)
router.get('/search', search)

module.exports = router
