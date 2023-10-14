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
		const dataType = Type(data)
		console.log('Evaluando: ' + (crtKey || 'ROOT'))
		if (!schema) return
		console.log(`Case ${dataType?.toUpperCase()}`)

		switch (dataType) {
			/////////////////////////OBJECT CASE/////////////////////////////
			case 'object':
				if (!isObject(schema)) {
					if (!update) throw Error(errorMsg(data, schema, crtKey))
				}
				const subData = {}

				const keys = Object.keys(update ? data : schema)

				keys.forEach(key => {
					const nextData = data[key]
					let nextSchema = schema[0]?.[key] || schema[key]
					const location = crtKey ? `${crtKey}.${key}` : key

					printLog({
						data,
						schema,
						dataKey: nextData,
						schemaKey: nextSchema,
						key,
						keys,
					})

					if (key.includes('$')) {
						console.log(`Action: ${key}`)
						subData[key] = evaluate(schema, nextData, location, update)
					} else if (key !== 'id') {
						if (!update) {
							if (!schema.hasOwnProperty(key)) return
							if (isArray(schema)) throw Error(errorMsg(data, schema, crtKey))
						}
						const payload = evaluate(nextSchema, nextData, location, update)
						if (payload !== undefined) subData[key] = payload
					}
				})

				if (!!Object.keys(subData).length) {
					let id = ''
					if (!data.id && schema[0]?.id !== false && schema?.id !== false) {
						id = ID()
					} else if (!!data.id) {
						if (Type(data.id) !== 'string') {
							throw Error('Id field should be a string')
						}
						id = data.id
					}
					return id ? { id, ...subData } : subData
				}
				return {}

			/////////////////////////ARRAY CASE/////////////////////////////
			case 'array':
				const schemaContent = schema[0]
				if (!isArray(schema) || !isArray(schemaContent)) {
					throw Error(errorMsg(data, schema, crtKey))
				}
				//EL problema esta en push y el objeto si es campo existente funciona sin problema
				// la validacion pero en un campo nuevo que entra como relatives falla porque pretende
				//que sea del mismo tipo que el schemaContent
				if (schemaContent) {
					/* 					if (Type(data) !== (schemaContent.type || Type(schemaContent))) {
						throw Error(errorMsg(data, Type(schemaContent), crtKey))
					} */
					return data.map((doc, idx) => {
						const location = `${crtKey}[${idx}]`
						return evaluate(schemaContent, doc, location)
					})
				}

				return data

			/////////////////////////DEFAULT CASE/////////////////////////////
			default:
				if (!data && data !== 0) {
					if (!!ref.required) {
						throw Error(
							`Field ${crtKey} it's required as a ${schema} value but recived ${
								data === '' ? '""' : data
							}`
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
					if (dataType === schema) {
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
	else valuePart = value === '' ? '""' : value

	let shouldBeValue = ''
	if (typeof schema === 'object') {
		if (isArray(schema) && schema[0]) {
			shouldBeValue = `array of ${Type(schema[0].type || schema[0])}s`
		} else {
			shouldBeValue = Type(schema)
		}
	} else shouldBeValue = schema

	return `Value ${valuePart} in ${location} it should be a ${shouldBeValue}.`
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
			keys,
			nextKey: key,
			nextSchema: prev(schemaKey),
			nexData: prev(dataKey),
		},
		'\n\n'
	)
}
