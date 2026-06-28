require('dotenv').config()

const cors = require('cors')
const express = require('express')
const morgan = require('morgan')
const connectDB = require('./config/db')
const errorHandler = require('./middleware/errorHandler')
const routes = require('./routes')
const registerJobs = require('./jobs')

const app = express()
const port = process.env.PORT || 5000
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
].filter(Boolean)
const devOriginPattern = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin) || devOriginPattern.test(origin)) {
        callback(null, true)
        return
      }

      callback(new Error(`CORS blocked origin: ${origin}`))
    },
  }),
)
app.use(express.json())
app.use(morgan('dev'))

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Samvida backend is running' })
})

app.use('/api', routes)
app.use(errorHandler)

connectDB()
  .then(() => {
    registerJobs()
    app.listen(port, () => {
      console.log(`Samvida backend listening on port ${port}`)
    })
  })
  .catch((error) => {
    console.error('Failed to start server', error)
    process.exit(1)
  })
