export const YMD = /^\d{4}([\-/.])(0?[1-9]|1[0-2])\1(3[01]|[12][0-9]|0?[1-9])$/
//2013-12-14
//2013-07-08
//2013-7-14
//2013/11/8
//2013.11.8

export const DMY = /^(?:3[01]|[12][0-9]|0?[1-9])([\-/.])(0?[1-9]|1[0-2])\1\d{4}$/
//31.12.3013
//01/01/2013
//5-3-2013
//15.03.2013

export const ISO8601 =
	/[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]+)?([Zz]|([\+-])([01]\d|2[0-3]):?([0-5]\d)?)?/
//2020-03-12T13:34:56.123Z

export const UNIX = /[0-9]\{10\}/

export const checkDate = str => {
	try {
		const unix = typeof str === 'number' ? str : Date.parse(str)
		const date = new Date(unix).toISOString()
		return { isValid: !isNaN(unix), unix, date }
	} catch (error) {
		return { isValid: false, unix: null, date: null }
	}
}

export const Type = value => {
	return Array.isArray(value) ? 'array' : value !== null ? typeof value : undefined
}

export const isObject = item => Type(item) === 'object'
export const isArray = item => Type(item) === 'array'
export const isNull = item => (item === null || item === undefined) && item !== 0
