import { Type } from './helpers.js'
import evalSchema from './validateSchema.js'

export const validateModel = (data, schema) => {
  const payload = evalSchema(schema, data)
  return payload
}

export const find = (list, params, options) => {
  const docs = []
  list.forEach((doc) => {
    if (Match(params, doc)) {
      const payload = getFields(options.fields, doc)
      docs.push(payload)
    }
  })
  return docs
}

export const getFields = (fields, doc) => {
  let payload = doc
  if (Type(fields) === 'object') {
    payload = { id: doc.id, ...fields(doc) }
  }
  if (Type(fields) === 'array') {
    const fields = fields.reduce((acc, curr) => {
      if (doc.hasOwnProperty(curr)) {
        acc[curr] = doc[curr]
      }
      return acc
    }, {})
    payload = { id: doc.id, ...fields }
  }
  return payload
}

export const update = (list, params, upgrade = {}, keys) => {
  const docs = []
  list.forEach((doc) => {
    if (Match(params, doc)) {
      doc = setChanges(upgrade, doc)
      docs.push(getFields(keys, doc))
    }
  })
  return docs
}

export const setChanges = (upgrade, doc, currKey) => {
  const keys = Object.entries(upgrade)
  keys.forEach(([key, value]) => {
    if (key.charAt(0) === '$') {
      switch (key) {
        case '$inc':
          const amouont = Number(value)
          if (isNaN(amouont)) {
            throw Error(errors.incrementStringValue(value, currKey))
          }
          if (Type(doc) !== 'number') {
            throw Error(errors.incrementStringField(value, currKey))
          }
          return (doc += amouont)

        case '$push':
          if (!Array.isArray(doc)) {
            throw Error(errors.pushNotArray(currKey))
          }
          if (!!upgrade.$push.$each) {
            return doc.push(...value.$each)
          } else {
            return doc.push(value)
          }
        case '$set':
          return
      }
    } else {
      if (Type(value) === 'object') {
        doc[key] = setChanges(
          value,
          doc[key],
          (currKey ? currKey + '.' : '') + key,
        )
      } else if (key !== 'id') {
        doc[key] = value
      }
    }
  })
  return doc
}

export const Match = (params, data) => {
  const keys = Object.entries(params)

  if (!keys.length) return true

  const match = keys.every(([key, param]) => {
    const value = data?.[key]

    if (key.charAt(0) === '$') {
      switch (key) {
        case '$or':
          return params.$or?.some((or) => Match(or, data))

        case '$and':
          return params.$and?.every((or) => Match(or, data))

        case '$match':
          return param?.every((f) => !!data?.includes(f))

        case '$in':
          if (Type(param) !== 'array') {
            return data?.some((v) => Match(param, v))
          } else {
            return data?.some((v) => param?.some((f) => Match(f, v)))
          }

        case '$gte':
          return data >= param

        case '$gt':
          return data > param

        case '$lte':
          return data <= param

        case '$lt':
          return data < param

        case '$ne':
          if (Type(data) === 'array') {
            if (Type(param) === 'array') {
              return param.every((f) => !data.includes(f))
            } else {
              return !data.includes(param)
            }
          } else {
            if (Type(param) === 'array') {
              return !param.includes(data)
            } else {
              return data !== param
            }
          }

        default:
          return false
      }
    } else {
      switch (Type(param)) {
        case 'object':
          return Match(param, value)
        case 'array':
          if (Type(value) === 'array') {
            return param.every((f) => value.includes(f))
          } else {
            return param.includes(value)
          }
        default:
          if (Type(value) === 'array') {
            return value.includes(param)
          } else {
            return value === param
          }
      }
    }
  })
  return match
}
