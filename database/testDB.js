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

User.update({ data: { name: 132 } }, { username: 'm.ruiz2' })
User.remove({ data: { gender: 'male' } })

const res = User.findOne({ username: 'm.ruiz2' }).values()

console.log(
  `\n************************ RESULTS ************************\n`,
  res,
  `\n`,
)

// probar types unique
// popular campos
// buscar en campos populados
// validate push each no valida
// no se esta validando el update de un documento
