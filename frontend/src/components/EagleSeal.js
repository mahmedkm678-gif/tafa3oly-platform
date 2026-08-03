/**
 * EagleSeal — ختم الجودة (نسر مصري هندسي)
 * @param {number} size - حجم الشارة (px)
 * @param {boolean} animate - هل تفعيل حركة الختم
 */
export function EagleSeal(size = 80, animate = false) {
  const cls = animate ? 'eagle-seal animate' : 'eagle-seal'
  return `
    <span class="${cls}" style="width:${size}px;height:${size}px;display:inline-flex">
      <svg viewBox="0 0 200 200" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <!-- Outer circle seal -->
        <circle cx="100" cy="100" r="96" fill="none" stroke="#C9A84C" stroke-width="2.5" opacity="0.9"/>
        <circle cx="100" cy="100" r="88" fill="none" stroke="#C9A84C" stroke-width="0.8" opacity="0.4"/>
        <!-- Decorative dots on circle -->
        <circle cx="100" cy="8" r="3" fill="#C9A84C" opacity="0.7"/>
        <circle cx="100" cy="192" r="3" fill="#C9A84C" opacity="0.7"/>
        <circle cx="8" cy="100" r="3" fill="#C9A84C" opacity="0.7"/>
        <circle cx="192" cy="100" r="3" fill="#C9A84C" opacity="0.7"/>

        <!-- Eagle body — geometric profile facing left (RTL) -->
        <g transform="translate(100,100)" fill="#C9A84C">
          <!-- Head -->
          <path d="M-8,-42 L-2,-50 L8,-46 L14,-38 L10,-30 L2,-28 L-8,-30 Z" opacity="0.95"/>
          <!-- Eye -->
          <circle cx="-2" cy="-40" r="2.5" fill="#0F0F14"/>
          <circle cx="-2" cy="-40.5" r="1" fill="#C9A84C" opacity="0.6"/>
          <!-- Beak (hooked) -->
          <path d="M-8,-42 L-18,-38 L-16,-34 L-8,-36 Z" opacity="0.9"/>
          <!-- Neck -->
          <path d="M-8,-30 L2,-28 L8,-20 L-2,-16 L-14,-20 Z" opacity="0.9"/>
          <!-- Body -->
          <path d="M-2,-16 L8,-20 L18,-10 L22,0 L18,12 L8,18 L-4,16 L-14,8 L-18,-4 L-14,-20 Z" opacity="0.85"/>
          <!-- Wing (folded) -->
          <path d="M18,-10 L32,-6 L38,2 L34,14 L24,20 L18,12 L22,0 Z" opacity="0.7"/>
          <path d="M24,20 L34,14 L40,22 L36,30 L26,30 L18,24 Z" opacity="0.6"/>
          <!-- Tail feathers -->
          <path d="M-4,16 L8,18 L12,30 L6,36 L-4,32 L-10,24 Z" opacity="0.75"/>
          <path d="M-10,24 L-4,32 L-12,36 L-18,30 L-14,22 Z" opacity="0.65"/>
          <!-- Wing detail lines -->
          <line x1="22" y1="-4" x2="30" y2="2" stroke="#0F0F14" stroke-width="0.6" opacity="0.3"/>
          <line x1="20" y1="2" x2="28" y2="8" stroke="#0F0F14" stroke-width="0.6" opacity="0.3"/>
          <line x1="22" y1="8" x2="30" y2="14" stroke="#0F0F14" stroke-width="0.6" opacity="0.3"/>
        </g>

        <!-- Text around circle (optional) -->
        <text font-family="Amiri, serif" font-size="11" fill="#C9A84C" opacity="0.6" letter-spacing="2">
          <textPath href="#sealTextPath" startOffset="50%" text-anchor="middle">تفاعلي · جودة · كفاءة مصرية</textPath>
        </text>
        <path id="sealTextPath" d="M 100,100 m -78,0 a 78,78 0 1,1 156,0 a 78,78 0 1,1 -156,0" fill="none"/>
      </svg>
    </span>
  `
}

/**
 * EagleSealSm — نسر صغير للـ navbar
 */
export function EagleSealSm(size = 28) {
  return EagleSeal(size, false)
}
