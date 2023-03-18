import fs from 'fs'
import schemas from './schemas.js'
import validateSchema from './validateSchema.js'
import useMatch from './match.js'


class store {
  constructor(defaults) {
    this.path = './'
    this.data = parseFile(this.path, defaults)
  }

  collection(collection) {
    if (!collection) throw new Error('You must select a collection')
    if (!this.data[collection]) throw new Error(`Can't point to ${collection}`)
    const target = this.data[collection]
    const schema = schemas[collection]

    const getCollection = () => this.data[collection]

    const match = useMatch(this.data[collection])

    const matchOne = (filter) => {
      const filters = Object.entries(filter)
      const index = this.data[collection].findIndex((doc) =>
        filters.every(([key, value]) => doc[key] === value),
      )
      return { index, doc: target[index] }
    }

    const getFields = (doc, fields) => {
      if (!fields.length) return doc
      const buffer = { id: doc.id }
      fields.forEach((f) => {
        return (buffer[f] = doc[f])
      })
      return buffer
    }

    const populate = ({ key, ref, populate }, data) => {
      const id = data[key]
      data[key] = this.data[ref].find((doc) => doc.id === id) || id
      return data
    }
    /////////////////////////////////////////
    return {
      getOne(filter = {}) {
        const { doc } = matchOne(filter)
        return {
          data: (fields = []) => getFields(doc, fields),
          populate: (params) => populate(params, doc),
        }
      },
      //////////////////////////////////////
      get(filter = {}) {
        const res = match(filter)
        return {
          data: (fields = []) => res.map((doc) => getFields(doc, fields)),
          populate: (params) => res.map((doc) => populate(params, doc)),
        }
      },
      //////////////////////////////////////
      add(data) {
        const doc = validateSchema(data, schema)
        getCollection().push(doc)
        return { data: (fields = []) => getFields(doc, fields) }
      },
      //////////////////////////////////////
      docs(filter = {}) {
        const { doc: data, index } = match(filter)
        if (!data) throw Error('document not finded')
        return {
          increment(values = {}) {
            Object.entries(values).forEach(([key, value]) => {
              if (data[key] && typeof data[key] === 'number') {
                data[key] += Number(value)
              }
            })
            return { data: (fields = []) => getFields(data, fields) }
          },
          update(upgrade = {}) {
            const valid = validateSchema(upgrade, schema)
            const doc = { ...data, ...valid }
            target[index] = doc
            return { data: (fields = []) => getFields(doc, fields) }
          },
        }
      },
      //////////////////////////////////////
      remove(filter = {}) {
        const filters = Object.entries(filter)
        let removed = []
        let target = getCollection()
        target = target.filter((doc) => {
          if (filters.every(([key, value]) => doc[key] === value)) {
            removed.push(doc)
          } else {
            return doc
          }
        })
        return removed
      },
    }
  }
}


const parseFile = (path, defaults) => {
  try {
    return JSON.parse(fs.readFileSync(path))
  } catch (error) {
    return defaults || {}
  }
}

export default store
