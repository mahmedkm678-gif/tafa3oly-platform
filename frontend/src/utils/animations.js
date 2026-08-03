/**
 * Scroll-reveal (IntersectionObserver) — عناصر .reveal و .text-reveal
 */
const revealObserver = new IntersectionObserver(entries => {
  for (const e of entries) {
    if (e.isIntersecting) {
      e.target.classList.add('in-view')
      revealObserver.unobserve(e.target)
    }
  }
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' })

export function initReveal(root = document) {
  if (!('IntersectionObserver' in window)) {
    root.querySelectorAll('.reveal, .text-reveal').forEach(el => el.classList.add('in-view'))
    return
  }
  const els = root.querySelectorAll('.reveal:not([data-reveal-bound]), .text-reveal:not([data-reveal-bound])')
  for (const el of els) {
    el.setAttribute('data-reveal-bound', '1')
    revealObserver.observe(el)
  }
}

/**
 * Counters — عناصر [data-count] تتحرك بالرقم عند ظهورها
 */
function animateCount(el) {
  const target = parseFloat(el.dataset.count || '0')
  const dur = parseInt(el.dataset.duration || '1800', 10)
  const suffix = el.dataset.suffix || ''
  const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals, 10) : 0
  const fmt = v => v.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
  const t0 = performance.now()
  function frame(t) {
    const p = Math.min((t - t0) / dur, 1)
    const eased = 1 - Math.pow(1 - p, 3)
    el.textContent = fmt(target * eased) + suffix
    if (p < 1) requestAnimationFrame(frame)
    else el.textContent = fmt(target) + suffix
  }
  requestAnimationFrame(frame)
}

const counterObserver = new IntersectionObserver(entries => {
  for (const e of entries) {
    if (e.isIntersecting) {
      animateCount(e.target)
      counterObserver.unobserve(e.target)
    }
  }
}, { threshold: 0.5 })

export function initCounters(root = document) {
  if (!('IntersectionObserver' in window)) {
    root.querySelectorAll('[data-count]').forEach(animateCount)
    return
  }
  const els = root.querySelectorAll('[data-count]:not([data-counter-bound])')
  for (const el of els) {
    el.setAttribute('data-counter-bound', '1')
    counterObserver.observe(el)
  }
}

/**
 * Parallax خفيف للهيرو — ختم النسر يتحرك ببطء مع السكرول
 */
let parallaxBound = false

export function initParallax() {
  if (parallaxBound) return
  parallaxBound = true
  let ticking = false
  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true
      requestAnimationFrame(() => {
        ticking = false
        const hero = document.getElementById('hero-section')
        if (!hero) return
        const y = Math.min(window.scrollY, window.innerHeight)
        const wrap = hero.querySelector('.hero-seal-wrap')
        const glow = hero.querySelector('.hero-glow')
        if (wrap) wrap.style.transform = `translateY(${y * 0.12}px)`
        if (glow) glow.style.transform = `translate(-50%, calc(-50% + ${y * -0.1}px))`
      })
    }
  }, { passive: true })
}

/**
 * Scroll Progress Bar Calculation
 */
let scrollProgressBound = false
export function initScrollProgress() {
  if (scrollProgressBound) return
  scrollProgressBound = true
  const bar = document.getElementById('scroll-progress')
  if (!bar) return
  window.addEventListener('scroll', () => {
    const winScroll = document.documentElement.scrollTop || document.body.scrollTop
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight
    const scrolled = height > 0 ? (winScroll / height) * 100 : 0
    bar.style.width = scrolled + '%'
  }, { passive: true })
}

/**
 * Cursor Glow Tracking Aura
 */
let cursorGlowBound = false
export function initCursorGlow() {
  if (cursorGlowBound) return
  cursorGlowBound = true
  const aura = document.getElementById('cursor-glow-aura')
  if (!aura) return
  window.addEventListener('mousemove', e => {
    aura.style.left = e.clientX + 'px'
    aura.style.top = e.clientY + 'px'
  }, { passive: true })
}

/**
 * 3D Tilt Cards effect
 */
export function initTiltCards(root = document) {
  const cards = root.querySelectorAll('.level-card, .benefit-card, .glass-card')
  for (const card of cards) {
    if (card.hasAttribute('data-tilt-bound')) continue
    card.setAttribute('data-tilt-bound', '1')

    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const xc = rect.width / 2
      const yc = rect.height / 2
      const maxTilt = 6
      const tiltX = ((yc - y) / yc) * maxTilt
      const tiltY = ((x - xc) / xc) * maxTilt
      
      card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-6px)`
    })

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)'
    })
  }
}

