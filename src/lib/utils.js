export function formatMessage(message) {
  return `[nuxt-datocms]: ${message}`
}

// The `window.onNuxtReady(fn)` are needed to avoid hydration issues:
// @see https://github.com/nuxt/nuxt.js/issues/4491#issuecomment-648979464
export const onReady = fn => window.onNuxtReady(() => fn())

// Feature check for Local Storage API
// @see https://mathiasbynens.be/notes/localstorage-pattern
export const storage = (() => {
  // eslint-disable-next-line new-parens
  const uid = new Date
  let storage
  let result
  try {
    (storage = window.localStorage).setItem(uid, uid)
    // eslint-disable-next-line eqeqeq
    result = storage.getItem(uid) == uid
    storage.removeItem(uid)
    return result && storage
  } catch (exception) {}
})()
