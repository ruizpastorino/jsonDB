import express from 'express'
import bodyParser from 'body-parser'
import { User } from './database/schemas.js'
import { createConection } from './database/main.js'

const app = express()

createConection('db.json')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.listen(4000, () => console.log('Server connected on port 4000'))

app.get('/', (req, res) => {
	try {
		addUser()
		const response = User.findOne({
			username: 'm.ruiz2',
		}).values()
		return res.json(response)
	} catch (error) {
		res.status(401).send(error.message)
	}
})

const addUser = () =>
	User.add({
		username: 'm.ruiz2',
		data: {
			name: 'maitena',
			lastname: 'ruiz ortega',
			age: 6,
			gender: 'male',
			birthDate: '2016-07-12T00:00:00.000Z',
		},

		password: 'pillow',
		tenant: '',
		rank: 25,
		tags: ['kinder', 'cats'],
		relatives: 
			{
				name: 'agustin',
				lastname: 'ruiz',
				age: '788',
				nicknames: [{ name: 'agustin' }],
			},
		
	})

const updatedUser = () =>
	User.update(
		{
			relatives: {
				$push: {
					$each: [
						{
							name: 'ana',
							lastname: 'gallardo',
							age: Date.now(),
							nicknames: [{ name: 'abuela ani', invalidField: 'wrong' }],
						},
					],
				},
			},
		},
		{ username: 'm.ruiz' }
	)

/* 
	
	relatives: {
				$push: {
					$each: [
						{
							name: 'ana',
							lastname: 'gallardo',
							age: Date.now(),
							nicknames: [{ name: 'abuela ani', invalidField: 'wrong' }],
						},
					],
				},
			},
	
	*/
