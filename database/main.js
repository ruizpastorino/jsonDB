import * as url from 'url'
import path from 'path'
import fs from 'fs'
import useMatch from './useMatch.js'
import { validateModel } from './actions.js'

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

const models = {}

let db = {}
let filename = 'db.json'

export const createConection = (name) => {
  filename = name || "db.json"
  let defaultModels = Object.entries(models).reduce((acc, [key, value]) => {
    acc[key] = value
    return acc
  }, {})

  let file = {}
  try {
    const rawFile = fs.readFileSync(path.join(__dirname, name))
    file = JSON.parse(rawFile)
  } catch (error) {
    console.log(error)
    writeFile(defaultModels)
    return defaultModels
  }
  const isModelsComplete = Object.keys(defaultModels).every((key) => file[key])
  db = { ...defaultModels, ...file }
  if (!isModelsComplete) {
    writeFile(db)
  }
}

export const CreateModel = (schema, name) => {
  const newModel = new Model(name, schema)
  models[name] = schema
  return newModel
}

export class Model {
  constructor(name, schema, options = {}) {
    this.name = name
    this.options = options
    this.schema = schema
  }

  find(filter = {}, { data } = {}) {
    const results = useMatch(db[this.name], filter, data).results()
    return new Results(results)
  }

  findOne(filter = {}, { data } = {}) {
    const results = useMatch(db[this.name], filter, data).results()
    return new Result(results[0])
  }

  update(upgrade = {}, filter = {}) {
    const results = useMatch(db[this.name], filter).update(upgrade)
    return new Results(results)
  }

  add(doc) {
    const payload = validateModel(doc, this.schema)
    db[this.name].push(payload)
    /* writeFile(db) */
    return payload
  }

  remove(filter = {}) {
    const results = useMatch(db[this.name], filter).remove()
    return new Results(results)
  }
}

class Result {
  #values
  #fields
  constructor(values = {}) {
    this.#values = values
    this.#fields = undefined
  }

  fields(schema) {
    this.#fields = schema
  }

  populate(reference) {
    if (Array.isArray(this.values)) {
      return new Results(this.values)
    } else {
      return new Result(this.values)
    }
  }

  values() {
    return this.#values
  }
}

class Results extends Result {
  #values
  #fields
  constructor(values = []) {
    super(values)
    this.#values = values
  }

  count() {
    return this.#values.length || 0
  }

  limit(qty, offset = 0) {
    return new Results(
      this.#values.slice(offset, qty + offset || this.#values.length),
    )
  }

  sort(field, order) {
    let sorted = this.#values

    if (!!field) {
      sorted = this.#values.sort((a, b) => {
        if (a[field] < b[field]) return -1
        if (a[field] > b[field]) return 1
        return 0
      })
    }

    return new Results(order === 'DESC' ? sorted.reverse() : sorted)
  }
}

const writeFile = (file) =>
  fs.writeFileSync(path.join(__dirname, filename), JSON.stringify(file))
