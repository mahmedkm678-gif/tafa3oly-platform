import { API_BASE } from './constants.js'
import { getToken } from './auth.js'

export async function api(method, url, body) {
  const opts = { method, headers: { 'Authorization': 'Token ' + getToken() } }
  if (body) {
    if (body instanceof FormData) {
      opts.body = body
    } else {
      opts.headers['Content-Type'] = 'application/json'
      opts.body = JSON.stringify(body)
    }
  }
  const r = await fetch(API_BASE + url, opts)
  const d = await r.json()
  if (!r.ok) {
    const e = new Error(d.error || 'خطأ في الطلب')
    e.data = d
    throw e
  }
  return d
}
