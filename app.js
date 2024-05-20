const express = require('express')
const app = express()
const port = 3001
app.get('/', (req, res) => res.send('Hello World !'))
app.get('/hala', (req, res) => res.send('Hello World Hala!'))
app.get('/angelo', (req, res) => res.send('Hello World angelo!'))
app.listen(port, () => console.log(`Example app listening on port ${port}!`))