import mysql from 'mysql2/promise'
import 'dotenv/config'

const DEFAULT_CONFIG = {
  host: 'localhost',
  user: 'root',
  port: '3306',
  password: 'Pnavarro.1',
  database: 'moviesdb'
}
const connectionString = process.env.DATABASE_URL ?? DEFAULT_CONFIG
const connection = await mysql.createConnection(connectionString)

export class MovieModel {
  static getAll = async ({ genre }) => {
    if (genre) {
      const lowercaseGenre = genre.toLowerCase()

      const [genres] = connection.query(
        'select id, name from genre where LOWER(name) = ?;', [lowercaseGenre]
      )

      if (genres.length === 0) return []

      const [{ id }] = genres

      console.log(id)
    }

    const [movies] = await connection.query(
      'select bin_to_uuid(id) id, title, year, director, duration, poster, rate from movie;'
    )

    return movies
  }

  static getById = async ({ id }) => {
    const [movies] = await connection.query(
      'select bin_to_uuid(id) id, title, year, director, duration, poster, rate from movie where id = uuid_to_bin(?);', [id]
    )

    if (movies.length === 0) return null

    return movies[0]
  }

  static create = async ({ input }) => {
    const {
      title,
      year,
      duration,
      director,
      rate,
      poster
    } = input

    const [uuidResult] = await connection.query('SELECT UUID() uuid;')
    const [{ uuid }] = uuidResult

    try {
      await connection.query(
        `insert into movie (id, title, year, director, duration, poster, rate) 
        values (UUID_TO_BIN("${uuid}"), ?, ?, ?, ?, ?, ?);`,
        [title, year, director, duration, poster, rate]
      )
    } catch (error) {
      throw new Error('Error creating movie')
    }

    const [movies] = await connection.query(
      'select bin_to_uuid(id) id, title, year, director, duration, poster, rate from movie where id = uuid_to_bin(?);', [uuid]
    )

    return movies[0]
  }

  static delete = async ({ id }) => {
    await connection.query(
      'delete from movie where id = uuid_to_bin(?);',
      [id]
    )

    return true
  }

  static update = async ({ id, input }) => {
    const movieToUpdate = await this.getById({ id })
    const updatedMovie = {
      ...movieToUpdate,
      ...input
    }

    const {
      title,
      year,
      director,
      duration,
      poster,
      rate

    } = updatedMovie

    try {
      await connection.query(
        `
          UPDATE movie SET
          title = ?,
          year = ?,
          director = ?,
          duration = ?,
          poster = ?,
          rate = ?
          WHERE id = uuid_to_bin(?)
        `,
        [title, year, director, duration, poster, rate, id]
      )
    } catch (error) {
      throw new Error('Error updating movie')
    }

    const [movies] = await connection.query(
      'select bin_to_uuid(id) id, title, year, director, duration, poster, rate from movie where id = uuid_to_bin(?);', [id]
    )

    return movies[0]
  }
}
