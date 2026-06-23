export function getToken() {
  return localStorage.getItem('access_token')
}

export function getUser() {
  try { return JSON.parse(localStorage.getItem('user') || '{}') } catch { return {} }
}

export function setUserData(u) {
  localStorage.setItem('user', JSON.stringify(u))
}

export function isLoggedIn() {
  return !!getToken()
}

export function getRole() {
  return getUser().role || ''
}

export function isStudent() {
  return getRole() === 'student'
}

export function isTutor() {
  return getRole() === 'tutor'
}

export function logout() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('user')
}
