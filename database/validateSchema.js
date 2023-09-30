import { checkDate, isObject, Type, isArray, isNull } from './helpers.js'
import { v4 } from 'uuid'

const evalSchema = (schema, data, update) => {
	console.log(`\n\n///////////////////////////// EVAL\n\n`)
	if (!schema) throw new Error('Model must be passed as params')
	return evaluate(schema, data, undefined, update)
}

const evaluate = (ref, data, crtKey, update) => {
	try {
		let schema = ref?.type || ref
		console.log('Evaluando: ' + crtKey)
		if(!schema) return
		switch (Type(data)) {
			/////////////////////////OBJECT CASE/////////////////////////////
			case 'object':
				console.log(`Case ${Type(data)}`)
				if (!isObject(schema)) {
					if (!update) throw Error(errorMsg(data, schema, crtKey))
				}
				const subData = {}
				let id = undefined

				if (!data.id && schema[0]?.id !== false && schema?.id !== false) {
					id = ID()
				} else if (!!data.id) {
					if (typeof data.id !== 'string') {
						throw Error('Id field must be a string')
					}
					id = data.id
				}

				const keys = Object.keys(update ? data : schema)

				keys.forEach(key => {
					const dataKey = data[key]
					let schemaKey = schema[0]?.[key] || schema[key]
					const location = crtKey ? `${crtKey}.${key}` : key

					printLog({ data, schema, schemaKey, dataKey, key, keys })

					if (key.includes('$')) {
						console.log(`Action: ${key}`)
						subData[key] = evaluate(schema, dataKey, location, update)
					} else {
						if (!update) {
							if (!schema.hasOwnProperty(key)) return
							if (isArray(schema)) throw Error(errorMsg(data, schema, crtKey))
						}
						const payload = evaluate(schemaKey, dataKey, location, update)
						if (payload !== undefined) subData[key] = payload
					}
				})

				if (!!Object.keys(subData).length) {
					return id ? { id, ...subData } : subData
				}
				return {}

			/////////////////////////ARRAY CASE/////////////////////////////
			case 'array':
				console.log(`Case ${Type(data)}`)
				if (isArray(schema)) {
					if (schema[0]) {
						return data.map((doc, idx) => {
							const location = `${crtKey}[${idx}]`
							return evaluate(schema[0], doc, location)
						})
					}
				} else {
					throw Error(errorMsg(data, schema, crtKey))
				}
				return data

			/////////////////////////DEFAULT CASE/////////////////////////////
			default:
				console.log(`Case ${Type(data)}`)
				if (isNull(data)) {
					if (!!ref.required) {
						throw Error(
							`Field ${crtKey} it's required as a ${schema} 
             value but recived ${Type(data)}`
						)
					} else if (!!schema.default) {
						return isObject(schema.default)
							? evaluate(schema.type, schema.default)
							: schema.default
					} else {
						return data
					}
				}

				if (schema === 'date') {
					const newDate = checkDate(data)
					if (!!newDate.isValid) {
						return newDate.date
					} else {
						throw Error(errorMsg(data, schema, crtKey))
					}
				} else {
					if (Type(data) === schema) {
						if (!!isArray(ref.enum) && !ref.enum.find(param => param === data)) {
							throw new Error(
								`Value ${data} of ${crtKey} must be one of [${ref.enum}]`
							)
						}
						return data
					} else {
						throw Error(errorMsg(data, schema, crtKey))
					}
				}
		}
	} catch (error) {
		/* console.log(error) */
		throw Error(error.message)
	}
}

//////////////////////////////////////////////////////////FIN DE EVALUACION

const errorMsg = (value, schema, location) => {
	return `Value ${
		typeof value === 'string'
			? `"${value}"`
			: typeof value === 'object'
			? Type(value)
			: value
	} in ${location} must be an ${
		typeof schema === 'object'
			? schema[0]
				? Type(schema[0]) //aca no estoy consiguiendo el tipo de un push
				: Type(schema)
			: schema || 'Something'
	}.`
}

export default evalSchema

const ID = () => {
	const uid = v4().replaceAll('-', '')
	return uid
}
const prev = element =>
	element ? JSON.stringify(element).substring(0, 60) + '...' : undefined

const printLog = ({ data, schema, key, schemaKey, dataKey, keys }) => {
	return console.log(
		{
			data: prev(data),
			schema: prev(schema),
			key,
			keys,
			schemaKey: prev(schemaKey),
			dataKey: prev(dataKey),
		},
		'\n\n'
	)
}
