export function navigateTo(path) {
  const hash = path.replace(/^\/+/, '')
  window.location.hash = hash
}
