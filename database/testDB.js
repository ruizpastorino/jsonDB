import { User } from './schemas.js'
import { createConection } from './main.js'

createConection('db.json')

const element = {
	name: 'ana',
	lastname: 'gallardo',
	age: Date.now(),
	nicknames: [{ name: 'abuela ani', invalidField: 'wrong' }],
}

const EACH = {
	$each: [
		{
			name: 'ana',
			lastname: 'gallardo',
			age: Date.now(),
			nicknames: [{ name: 'abuela ani', invalidField: 'wrong' }],
		},
		{
			name: 'gonzalo',
			lastname: 'vidale',
			age: Date.now(),
			nicknames: [{ name: 'tito' }],
		},
	],
}

export function updatedUser() {
	User.update(
		{
			relatives: {
				$push: [element],
			},
		},
		{ username: 'm.ruiz' }
	)
}

export function addUser() {
	return User.add({
		username: 'm.ruizOrtega',

		data: {
			name: 'maitena',
			lastname: 'ruiz ortega',
			age: 2,
			gender: 'male',
			birthDate: '2016-07-12T00:00:00.000Z',
		},

		password: 'pillow',
		tenant: '',
		rank: 25,
		tags: [],
		relatives: [
			{
				name: 'agustin',
				lastname: 'true',
				age: '2020-10-04',
				nicknames: [{ name: 'agustin' }],
			},
		],
	})
}


updatedUser()