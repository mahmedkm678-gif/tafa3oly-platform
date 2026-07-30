import { API_BASE } from './constants.js'
import { getToken } from './auth.js'

export async function api(method, url, body, { auth = true } = {}) {
  const opts = { method, headers: {} }
  if (auth && getToken()) {
    opts.headers['Authorization'] = 'Token ' + getToken()
  }
  if (body) {
    if (body instanceof FormData) {
      opts.body = body
    } else {
      opts.headers['Content-Type'] = 'application/json'
      opts.body = JSON.stringify(body)
    }
  }
  const r = await fetch(API_BASE + url, opts)
  const text = await r.text()
  let d
  try { d = JSON.parse(text) } catch { d = { error: text || 'خطأ غير متوقع' } }
  if (!r.ok) {
    const e = new Error(d.error || d.detail || 'خطأ في الطلب')
    e.data = d
    throw e
  }
  return d
}
