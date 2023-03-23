import { find, remove, update } from './actions.js'

const useMatch = (list, params, options) => {
  return {
    results: () => find(list, params, options),
    update: (upgrade) => update(list, params, upgrade),
    remove: () => remove(list, params),
  }
}

export default useMatch
