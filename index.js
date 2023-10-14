import express from 'express'
import bodyParser from 'body-parser'
import { createConection } from './database/main.js'
import './database/testDB.js'
import { User } from './database/schemas.js'
import { addUser, updatedUser } from './database/testDB.js'

const app = express()

createConection('db.json')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.listen(4000, () => console.log('Server connected on port 4000'))

app.get('/:user', (req, res) => {
	try {
		updatedUser()
		const response = User.findOne({
			username: req.params.user,
		}).values()

		if (!response) {
			res.status(404).json({ message: 'user not found', param: req.params.user })
		}

		return res.json(response)
	} catch (error) {
		res.status(401).send(error.message)
		console.log({ message: error.message.toUpperCase() })
	}
})
