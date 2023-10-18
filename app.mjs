import express from 'express'
import crypto from 'node:crypto'
import cors from 'cors'
import { validateMovie, validatePartialMovie } from './schemas/movies.mjs'

import movies from './movies.json' assert { type: 'json'}

const app = express()
app.use(express.json())
app.use(cors({
  origin: (origin, callback) => {
    const ACCEPTED_ORIGINS = [
      'http://localhost:8080',
      'http://localhost:1234',
      'https://movies.com',
      'https://midu.dev'
    ]

    if (ACCEPTED_ORIGINS.includes(origin)) {
      return callback(null, true)
    }

    if (!origin) {
      return callback(null, true)
    }

    return callback(new Error('Not allowed by CORS'))
  }
}))
const port = process.env.PORT ?? 1234

// forma nativa de express de hacer el middleware de mas abajo
app.use(express.json())

app.get('/movies', (req, res) => {
  const { genre } = req.query
  if (genre) {
    const filteredMovies = movies.filter(movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase()))

    return res.json(filteredMovies)
  }

  res.json(movies)
})

app.get('/movies/:id', (req, res) => {
  const { id } = req.params

  const movie = movies.find(movie => movie.id === id)
  if (movie) return res.json(movie)

  res.status(404).json({ message: 'Movie not found' })
})

app.post('/movies', (req, res) => {
  const result = validateMovie(req.body)

  if (result.error) {
    return res.status(400).json({ error: JSON.parse(result.error.message) })
  }

  const newMovie = { id: crypto.randomUUID(), ...result.data }

  // solo es una prueba para el ejercicio, pero así no se hace REST
  movies.push(newMovie)

  res.status(201).json(newMovie) // actualizar la caché del cliente
})

app.patch('/movies/:id', (req, res) => {
  
  const result = validatePartialMovie(req.body)
  
  if (result.error) {
    return res.status(400).json({ error: JSON.parse(result.error.message) })
  }
  const { id } = req.params
  const movieIndex = movies.findIndex(movie => movie.id === id)

  if (movieIndex === -1) return res.status(404).json({message: 'Movie not found'})

  const updatedMovie = { 
    ...movies[movieIndex],
    ...result.data
  }

  movies[movieIndex] = updatedMovie

  return res.json(updatedMovie)

})

// La última opcion a la que entraría (para controlar error, por ej)
app.use((req, res) => {
  res.status(404).send('<h1>404</h1>')
})

app.listen(port, () => {
  console.log(`server listening on port http://localhost:${port}`)
})
