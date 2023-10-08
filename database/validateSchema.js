import { checkDate, isObject, Type, isArray, isNull } from './helpers.js'
import { v4 } from 'uuid'

const evalSchema = (schema, data, update) => {
	console.log(`\n\n///////////////////////////// EVAL\n\n`)
	if (!schema) throw new Error('Model should be passed as params')
	return evaluate(schema, data, undefined, update)
}

const evaluate = (ref, data, crtKey, update) => {
	try {
		let schema = ref?.type || ref
		console.log('Evaluando: ' + (crtKey || 'ROOT'))
		if (!schema) return
		console.log(`Case ${Type(data).toUpperCase()}`)

		switch (Type(ref)) {
			/////////////////////////OBJECT CASE/////////////////////////////
			case 'object':
				if (!isObject(data)) {
					if (!update) throw Error(errorMsg(data, schema, crtKey))
				}
				const subData = {}
				let id = undefined

				if (!data.id && schema[0]?.id !== false && schema?.id !== false) {
					id = ID()
				} else if (!!data.id) {
					if (typeof data.id !== 'string') {
						throw Error('Id field should be a string')
					}
					id = data.id
				}

				const keys = Object.keys(update ? data : schema)

				keys.forEach(key => {
					const nextData = data[key]
					let nextSchema = schema[0]?.[key] || schema[key]
					const location = crtKey ? `${crtKey}.${key}` : key

					printLog({
						data,
						schema,
						schemaKey: nextSchema,
						dataKey: nextData,
						key,
						keys,
					})

					if (key.includes('$')) {
						console.log(`Action: ${key}`)
						subData[key] = evaluate(schema, nextData, location, update)
					} else {
						if (!update) {
							if (!schema.hasOwnProperty(key)) return
							if (isArray(schema)) throw Error(errorMsg(data, schema, crtKey))
						}
						const payload = evaluate(nextSchema, nextData, location, update)
						if (payload !== undefined) subData[key] = payload
					}
				})

				if (!!Object.keys(subData).length) {
					return id ? { id, ...subData } : subData
				}
				return {}

			/////////////////////////ARRAY CASE/////////////////////////////
			case 'array':
				if (!isArray(data)) throw Error(errorMsg(data, schema, crtKey, update))
				if (!isArray(schema)) throw Error(errorMsg(data, schema, crtKey))
				
				if (schema[0]) {
					return data.map((doc, idx) => {
						const location = `${crtKey}[${idx}]`
						return evaluate(schema[0], doc, location)
					})
				}

				return data

			/////////////////////////DEFAULT CASE/////////////////////////////
			default:
				if (isNull(data)) {
					if (!!ref.required) {
						throw Error(`Field ${crtKey} it's required
						 as a ${schema} value but recived ${Type(data)}`)
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
								`Value ${data} of ${crtKey} should be one of [${ref.enum}]`
							)
						}
						return data
					} else {
						throw Error(errorMsg(data, schema, crtKey))
					}
				}
		}
	} catch (error) {
		//console.log(error)
		throw Error(error.message)
	}
}

//////////////////////////////////////////////////////////FIN DE EVALUACION

const errorMsg = (value, schema, location, update) => {
	let valuePart = ''
	if (value === 'string') valuePart = `"${value}"`
	else if (typeof value === 'object') valuePart = Type(value)
	else valuePart = value

	let shouldBeValue = ''
	if (typeof schema === 'object') {
		if (isArray(schema) && schema[0]) {
			shouldBeValue = `it should be an array of ${Type(
				schema[0].type || schema[0]
			)}s`
		} else {
			shouldBeValue = Type(schema)
		}
	} else shouldBeValue = schema || 'Something'

	return `Value ${valuePart}  in ${location} it should be a ${shouldBeValue}.`
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
