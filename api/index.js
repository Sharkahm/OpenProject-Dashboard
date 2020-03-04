const express = require('express')
const knex = require('./db/knex.js')
const app = express()
app.use(express.json())
app.get('/api', (req, res) => {
    res.send('Willkommen im OpenProject Dashboard-API')
})
app.listen(3000, () => console.log("Listening on port 3000"))
