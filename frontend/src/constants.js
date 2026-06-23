export const API_BASE = import.meta.env.VITE_API_BASE || 'https://mahmoudkaram326.pythonanywhere.com'

export const LEVELS_DATA = [
  { code: 'quran', label: 'القرآن الكريم', icon: 'fa-mosque' },
  { code: 'university', label: 'الجامعة', icon: 'fa-university' },
  { code: 'high_school', label: 'الثانوية', icon: 'fa-school' },
  { code: 'middle_school', label: 'المتوسطة', icon: 'fa-book-open' },
  { code: 'primary', label: 'الابتدائية', icon: 'fa-child' },
  { code: 'kindergarten', label: 'رياض الأطفال', icon: 'fa-cubes' },
  { code: 'languages', label: 'اللغات', icon: 'fa-language' },
]

export const LEVEL_ICONS = Object.fromEntries(LEVELS_DATA.map(l => [l.code, l.icon]))
export const LEVEL_MAP = Object.fromEntries(LEVELS_DATA.map(l => [l.code, l.label]))

export const LANG_DATA = [
  { code: 'en', label: 'الإنجليزية' }, { code: 'fr', label: 'الفرنسية' },
  { code: 'de', label: 'الألمانية' }, { code: 'es', label: 'الإسبانية' },
  { code: 'it', label: 'الإيطالية' }, { code: 'tr', label: 'التركية' },
  { code: 'zh', label: 'الصينية' }, { code: 'ru', label: 'الروسية' },
]
export const LANG_MAP = Object.fromEntries(LANG_DATA.map(l => [l.code, l.label]))

export const DAYS = [
  { key: 'sat', label: 'السبت' }, { key: 'sun', label: 'الأحد' },
  { key: 'mon', label: 'الإثنين' }, { key: 'tue', label: 'الثلاثاء' },
  { key: 'wed', label: 'الأربعاء' }, { key: 'thu', label: 'الخميس' },
  { key: 'fri', label: 'الجمعة' },
]

export const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
