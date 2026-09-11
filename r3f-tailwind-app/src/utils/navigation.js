export function navigateTo(path) {
  const pathname = path.startsWith('/') ? path : `/${path}`
  window.history.pushState({}, '', pathname)
  window.dispatchEvent(new PopStateEvent('popstate'))
}
