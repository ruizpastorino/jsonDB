import { Type } from './helpers.js'
import evalSchema from './validateSchema.js'

export const validateModel = (data, schema) => {
  const payload = evalSchema(schema, data)
  return payload
}

export const find = (list, params, options) => {
  const { fields } = options
  const docs = []
  list.forEach((doc) => {
    if (Match(params, doc)) {
      const payload = typeof fields === 'object' ? getFields(fields, doc) : doc
      docs.push(payload)
    }
  })
  return docs
}

export const getFields = (schema, doc, exclude) => {
  const excluding =
    exclude || (schema?.exclude && Type(schema.exclude) === 'object')
  let payload = {}

  for (let key in excluding ? doc : schema) {
    const schemaKey = schema[key] || schema.exclude?.[key]
    switch (Type(schemaKey)) {
      case 'object':
        payload[key] = getFields(schemaKey, doc[key], excluding)
        break
      case 'array':
        payload[key] = doc[key].map((d) =>
          getFields(schemaKey[0], d, excluding),
        )
        break
      default:
        if (excluding ? schemaKey !== true : !!schemaKey) {
          payload[key] = doc[key]
        }

        break
    }
  }
  return payload
}

export const update = (list, params, upgrade = {}) => {
  let updated = 0
  const docs = []
  const collection = list.map((doc) => {
    if (Match(params, doc)) {
      updated++
      doc = setChanges(upgrade, doc)
      docs.push(doc)
    }
    return doc
  })
  return { docs, collection, updated }
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
          return doc = value
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

export const remove = (list, params) => {
  let removed = 0
  const collection = list.filter((doc) => {
    if (!Match(params, doc)) {
      removed++
      return doc
    }
  })
  return { removed, collection }
}

export const Match = (params, data) => {
  const keys = Object.entries(params)

  if (!keys.length) return true

  const match = keys.every(([key, param]) => {
    const value = data?.[key]

    if (key.charAt(0) === '$') {
      switch (key) {
        case '$regex':
          const regex = new RegExp(param)
          return data.match(regex)
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
