const express = require('express')
const cookieParser = require('cookie-parser')
const globalRouter = require('./routes')

const app = express()

app.use(express.json())

app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

app.use('/api', [globalRouter])

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(3030, () => {
  console.log(3030, '포트로 서버가 열렸어요!')
})
