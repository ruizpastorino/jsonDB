import * as url from 'url'
import path from 'path'
import fs from 'fs'
import useMatch from './useMatch.js'
import { validateModel } from './actions.js'

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

const collections = {}

let filename = 'db.json'

let db = {}

export const createConection = (name) => {
  filename = name || 'db.json'
  let defaults = Object.keys(collections).reduce((acc, key) => {
    acc[key] = []
    return acc
  }, {})
  let file = {}
  try {
    file = readFile()
  } catch (error) {
    writeFile(defaults)
    return collections
  }
  const isModelsComplete = Object.keys(defaults).every((key) => file[key])
  if (!isModelsComplete) {
    let db = { ...defaults, ...file }
    writeFile(db)
  }
}

export const CreateModel = (schema, name) => {
  const newModel = new Model(name, schema)
  collections[name] = schema
  return newModel
}

const optionsModel = {
  fields: Object || { exclude: Object },
  sortBy: String || Array,
  order: String,
  populate: String || Array || Object,
}

export class Model {
  constructor(name, schema, options = {}) {
    this.name = name
    this.options = options
    this.schema = schema
  }

  find(filter = {}, options = optionsModel) {
    const results = useMatch(db[this.name], filter, options).results()
    return Results(results)
  }

  findOne(filter = {}, options = optionsModel) {
    const results = useMatch(db[this.name], filter, options).results()
    return Result(results[0])
  }

  update(data = {}, filter = {}) {
    const { docs, collection } = useMatch(db[this.name], filter).update(data)
    db[this.name] = collection
    writeFile(db)
    return { updated: docs, total: docs.length }
  }

  add(data) {
    const doc = validateModel(data, this.schema)
    db[this.name].push(doc)
    writeFile(db)
    return doc
  }

  remove(filter = {}, options = optionsModel) {
    const { removed, collection } = useMatch(db[this.name], filter).remove()
    db[this.name] = collection
    writeFile(db)
    return { removed, total: removed.legnth }
  }
}

const Result = (values) => ({
  values: () => {
    return values
  },
})

const Results = (values = []) => {
  return {
    count: () => {
      return values.length || 0
    },

    limit: (qty, offset = 0) => {
      return Results(values.slice(offset, qty + offset || values.length))
    },

    sort: (field, order) => {
      let sorted = values

      if (!!field) {
        sorted = values.sort((a, b) => {
          if (a[field] < b[field]) return -1
          if (a[field] > b[field]) return 1
          return 0
        })
      }

      return Results(order === 'DESC' ? sorted.reverse() : sorted)
    },
    values: () => {
      return values
    },
  }
}

const readFile = (collection) => {
  try {
    const rawFile = fs.readFileSync(path.join(__dirname, filename))
    const file = JSON.parse(rawFile)
    db = file
    return collection ? file[collection] : file
  } catch {
    throw Error('no such file in folder')
  }
}

const writeFile = (upgrade) => {
  /* fs.writeFileSync(path.join(__dirname, filename), JSON.stringify(upgrade)) */
  db = upgrade
}
