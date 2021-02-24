require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const mongoose = require('mongoose')

const directoryRoutes = require('./routes/directory')
const fileRoutes = require('./routes/file')

const init = async () => {
    const app = express()
    app.use(helmet())
    app.use(cors())
    app.use(express.json())
    app.use(express.urlencoded({ extended: false }))
    app.use('/api/dir', directoryRoutes)
    app.use('/api/file', fileRoutes)
    try {
        await mongoose.connect(process.env.DB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        app.listen(process.env.PORT, () => {
            console.log(
                `server started on http://localhost:${process.env.PORT}`
            )
        })
    } catch (err) {
        console.log(`something went wrong => ${err}`)
    }
}

init()
