import 'dotenv/config'
import mongoose from 'mongoose'

const { Schema, model } = mongoose

const URI_STRING = 'mongodb+srv://quiquemorato:Pnavarro.1@cluster0.oks3rdo.mongodb.net/qiqedb?retryWrites=true&w=majority'

const connectionString = process.env.DATABASE_URL_MONGO ?? URI_STRING
mongoose.connect(connectionString)

const movieSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Movie title is required']

  },
  year: {
    type: Number,
    min: 1900,
    max: 2024
  },
  director: String,
  duration: {
    type: Number,
    min: 0
  },
  rate: {
    type: Number,
    min: 0,
    max: 10,
    default: 5
  },
  poster: String,
  genre: {
    type: [String],
    enum: {
      values: ['Action', 'Adventure', 'Sci-Fi', 'Fantasy', 'Crime', 'Romance', 'Drama'],
      message: 'Movie genre must be an array of enum Genre'
    },
    required: [true, 'Movie genre is required']
  }
})

// Hacemos esto para que, al devolver cada elemento de tipo 'Movie', reemplace el parámetro "_id" por "id" y borre "__v", que no queremos
movieSchema.set('toJSON', {
  transform: (_/* document */, returnedObject) => {
    returnedObject.id = returnedObject._id
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Movie = model('Movie', movieSchema)

export class MovieModel {
  static getAll = async ({ genre }) => {
    const payload = genre ? { genre } : {}
    try {
      const result = await Movie.find(payload)
      return result
    } catch (error) {
      console.log(error)
    } finally {
      // mongoose.connection.close()
    }
  }

  static getById = async ({ id }) => {
    try {
      const result = await Movie.findById(id)
      return result
    } catch (error) {
      return error
    } finally {
      // mongoose.connection.close()
    }
  }

  static create = async ({ input }) => {
    const newMovie = new Movie({ ...input })

    try {
      const result = await newMovie.save()
      return result
    } catch (error) {
      console.log('create error', error)
    } finally {
      // mongoose.connection.close()
    }
  }

  static delete = async ({ id }) => {
    try {
      const result = await Movie.findByIdAndDelete(id)
      return result
    } catch (error) {
      return error
    }
  }

  static update = async ({ id, input }) => {
    try {
      const result = await Movie.findByIdAndUpdate(id, input, { new: true })
      return result
    } catch (error) {
      return error
    }
  }
}
