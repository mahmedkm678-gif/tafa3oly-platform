export function $ (id) {
  return document.getElementById(id)
}

export function show(el) {
  if (typeof el === 'string') el = $(el)
  if (el) el.classList.remove('hidden')
}

export function hide(el) {
  if (typeof el === 'string') el = $(el)
  if (el) el.classList.add('hidden')
}

export function formatDate(d) {
  return new Date(d).toLocaleDateString('ar')
}

const ESC_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
export function esc(str) {
  if (str == null) return ''
  return String(str).replace(/[&<>"']/g, c => ESC_MAP[c])
}
