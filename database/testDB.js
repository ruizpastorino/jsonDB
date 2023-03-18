import { User } from './schemas.js'
import { createConection } from './main.js'

createConection('db.json')

User.add({
  data: {
    name: 'maitena',
    lastname: 'ruiz ortega',
    age: 6,
    gender: 'female',
    birthDate: '2016-07-12T00:00:00.000Z',
  },
  username: 'm.ruiz2',
  password: 'pillow',
  tenant: '',
  rank: 25,
  tags: ['kinder', 'cats', 2],
  relatives: [
    { name: 'agustin', lastname: 'ruiz', age: 1679114386788 },
    { name: 'ivana', lastname: 'ortega', age: '1985-05-10' },
  ],
})

const update = User.update({ data: { age: 7 } }, { username: 'm.ruiz2' })

const newUser = User.find({ username: 'm.ruiz' })

const res = newUser.values()

console.clear()
console.log(
  `\n************************ RESULTS ************************\n`,
  update,
  `\n`,
)

// falta buscar regex o ilike