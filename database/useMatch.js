import {find, update } from './actions.js'

const useMatch = (list, params, options) => {
  return {
    results: () => find(list, params, options),  
    update: (upgrade) => update(list, params, upgrade),
    remove: () =>  list.filter((doc) => !Match(params, doc))
  }
}

export default useMatch


