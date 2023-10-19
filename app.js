import express from 'express'

import { corsMiddleware } from './middlewares/cors.js'
import { moviesRouter } from './routes/movies.js'

const app = express()
app.use(express.json())
app.use(corsMiddleware())
const port = process.env.PORT ?? 1234

app.use('/movies', moviesRouter)

// La última opcion a la que entraría (para controlar error, por ej)
app.use((req, res) => {
  res.status(404).send('<h1>404</h1>')
})

app.listen(port, () => {
  console.log(`server listening on port http://localhost:${port}`)
})
