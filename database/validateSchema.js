import { checkDate, Type } from './helpers.js'
import { v1 } from 'uuid'

const evalSchema = (schema, data) => {
  try {
    if (!schema) throw new Error('Model must be passed as params')
    return evaluate(schema, data)
  } catch (err) {
    throw Error(err)
  }
}

const evaluate = (ref, data, currKey) => {
  const schemaType = ref.type || ref
  try {
    switch (Type(data)) {
      case 'object':
        const payload = {}
        if (!data.id && ref.id !== false) {
          payload.id = `${v1()}/${Math.ceil(
            Math.random() * (9999 - 1000) + 1000,
          )}`
        } else if (!!data.id) {
          if (typeof data.id !== 'string')
            throw Error('Id field must be a string')
          payload.id = data.id
        }
        const keys = Object.entries(ref)
        keys.forEach(([key, typeRef]) => {
          const value = data[key]
          const valid = evaluate(
            typeRef,
            value,
            currKey ? currKey + '.' + key : key,
          )
          if (valid !== undefined) {
            payload[key] = valid
          }
        })
        if (Object.keys(payload).length) {
          return payload
        }
        return undefined

      case 'array':
        if (Type(schemaType) === 'array') {
          if (!!schemaType[0]) {
            return data.map((d, idx) => {
              return evaluate(schemaType[0], d, `${currKey}[${idx}]`)
            })
          } else {
            return data
          }
        }
        return

      default:
        const message = `Value ${
          typeof data === 'string' ? `"${data}"` : data
        } must be a ${
          typeof schemaType === 'object' ? Type(schemaType) : schemaType
        } at ${currKey}`

        if (!data && data !== 0 && !!ref.required) {
          throw Error(`Field ${currKey} it's required as a ${schemaType} value but recived ${data}`)
        }

        if (!data) {
          if (ref.default) {
            return isObject(ref.default)
              ? evaluate(ref.type, ref.default)
              : ref.default
          } else {
            return data
          }
        }

        if (schemaType === 'date') {
          const newDate = checkDate(data)
          if (!!newDate.isValid) {
            return newDate.date
          } else {
            throw Error(message)
          }
        } else {
          if (Type(data) === schemaType) {
            return data
          } else {
            throw Error(message)
          }
        }
    }
  } catch (error) {
    throw Error(error.message)
  }
}

const isObject = (item) => Type(item) === 'object'

export default evalSchema
