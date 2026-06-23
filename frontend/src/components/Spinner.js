export function Spinner(size = 'md') {
  const sizes = { sm: '20px', md: '36px', lg: '56px' }
  const px = sizes[size] || sizes.md
  return `<div class="spinner" style="width:${px};height:${px};border:3px solid rgba(139,92,246,0.15);border-top-color:var(--accent-purple);border-radius:50%;animation:spin 0.7s linear infinite;margin:0 auto"></div>`
}

export function Skeleton({ width = '100%', height = '16px', count = 1, style = '' } = {}) {
  const items = Array.from({ length: count }, () =>
    `<div class="skeleton" style="width:${width};height:${height};background:rgba(255,255,255,0.04);border-radius:8px;animation:pulse 1.5s ease-in-out infinite;${style}"></div>`
  ).join('')
  return `<div class="skeleton-group" style="display:flex;flex-direction:column;gap:12px">${items}</div>`
}

export function SkeletonCard() {
  return `
    <div class="card" style="padding:20px">
      ${Skeleton({ width: '60%', height: '20px', count: 1 })}
      ${Skeleton({ width: '100%', height: '12px', count: 3, style: 'margin-top:8px' })}
      <div style="display:flex;gap:8px;margin-top:16px">
        ${Skeleton({ width: '80px', height: '32px' })}
        ${Skeleton({ width: '80px', height: '32px' })}
      </div>
    </div>
  `
}
