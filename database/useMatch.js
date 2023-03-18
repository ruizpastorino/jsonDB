import {find, update } from './actions.js'

const useMatch = (list, params, data) => {
  return {
    results: () => find(list, params, data),  
    update: (upgrade) => update(list, params, upgrade),
    remove: () =>  list.filter((doc) => !Match(params, doc))
  }
}

export default useMatch


