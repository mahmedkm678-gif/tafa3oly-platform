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
