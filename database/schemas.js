import { CreateModel } from './main.js'

const schemas = {}

schemas.users = {
	username: { type: 'string', required: true },
	data: {
		name: 'string',
		lastname: 'string',
		age: 'number',
		birthDate: 'date',
		gender: { type: 'string', enum: ['male', 'female'] },
	},
	active: { type: 'boolean', default: true },
	password: 'string',
	tenant: 'string',
	tags: ['string'],
	createDate: { type: 'date', default: new Date().toISOString() },
	rank: 'number',
	relatives: [
		{
			name: { type: 'string', required: true },
			lastname: 'string',
			age: 'date',
			id: false,
			nicknames: [{ id: false, name: { type: 'string', required: true } }],
		},
	],
}

schemas.accounts = {
	name: 'string',
	type: 'string',
	state: { type: 'string', default: 'active' },
	balance: { type: 'number', default: 0 },
	user: { type: 'ref', schema: 'accounts' },
	keys: [],
	nKeys: [],
	owner: 'object',
}

const subCategory = {
	name: 'string',
	icon: 'string',
}

schemas.categories = {
	user: { type: 'ref', schema: 'users' },
	name: 'string',
	subCategories: [subCategory],
	icon: 'string',
}

const payment = {
	date: { type: 'date', default: Date.now().toString() },
	amount: 'number',
	destiny: { type: 'ref', schema: 'accounts' },
	type: 'string',
}

schemas.loans = {
	amount: { type: 'string', default: 0 },
	date: { type: 'date', default: Date.now().toString() },
	state: { type: 'string', default: 'active' },
	person: { type: 'ref', schema: 'accounts' },
	origin: { type: 'ref', schema: 'accounts' },
	user: { type: 'ref', schema: 'users' },
	payments: [payment],
}

schemas.movements = {
	amount: { type: 'string', default: 0 },
	category: 'string',
	subCategory: 'string',
	date: { type: 'date', default: Date.now().toString() },
	state: { type: 'string', default: 'active' },
	origin: { type: 'ref', schema: 'accounts' },
	destiny: { type: 'ref', schema: 'accounts' },
	user: { type: 'ref', schema: 'users' },
	accountBalance: { type: 'number', default: 0 },
	type: { type: 'string', default: 'expense' },
}

export const User = CreateModel(schemas.users, 'users')
export const Account = CreateModel(schemas.accounts, 'accounts')
export const Movement = CreateModel(schemas.movements, 'movements')
export const Category = CreateModel(schemas.categories, 'categories')
export const Loans = CreateModel(schemas.loans, 'loans')

export default schemas
