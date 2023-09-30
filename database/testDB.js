import { User } from './schemas.js'
import { createConection } from './main.js'

createConection('db.json')

//addUser()
//updateUser()

export function updateUser() {
  User.update(
    {
      relatives: {
        $push: {
          /*        name: 'ana',
          lastname: 'gallardo',
          age: Date.now(), */
          nicknames: [{ name: 'abuela ani', invalidField: 'wrong' }],
        },
      },
    },
    { username: 'm.ruiz' },
  )
}

//User.remove({ data: { gender: 'male' } })

const res = User.findOne(
  { username: 'm.ruiz' },
  { fields: { relatives: [{ nicknames: true }] } },
).values()

console.log(
  `\n************************ RESULTS ************************\n`,
  res,
  `\n`,
)

function addUser() {
  User.add({
    username: 'm.ruiz2',
    data: {
      name: 'maitena',
      lastname: 'ruiz ortega',
      age: 6,
      gender: 'female',
      birthDate: '2016-07-12T00:00:00.000Z',
    },

    password: 'pillow',
    tenant: '',
    rank: 25,
    tags: ['kinder', 'cats', 2],
    relatives: [
      {
        name: 'agustin',
        lastname: 'ruiz',
        age: '788',
        nicknames: [{ name: 'si va' }],
      },
    ],
  })
}

//nicknames:[{lastname:"any"}] // evalua un caso que no existe y no reconoce el required
//Value "agustin" in relatives.$push.$each[0].nicknames[0].lastname must be an undefined.

//fields si no existe el campo lo crea o si se pasa {} o [] lo devuelve
//fields en un array valida si se marca un array pasar solo un objeto

// sigue fallando la validacion en $each y $push
// probar cuando encuentre $ obtener el valor con un bucle
//validacion funciona pero campos requeridos no los mira por lo menos en un array

// probar types unique
// popular campos
// buscar en campos populados
// validate push each no valida
// no se esta validando el update de un documento
