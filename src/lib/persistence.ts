import type { ProductState } from './products'

const HASH_KEY = 'c'
const STORAGE_KEY = 'comparador-beneficios:v1'

export function encode(items: ProductState[]): string {
  const parts: string[] = []
  for (const item of items) {
    if (item.input === 'toggle') {
      if (item.value) parts.push(item.id)
    } else {
      if (item.value > 0) parts.push(`${item.id}:${item.value}`)
    }
  }
  return parts.join(',')
}

function decode(str: string, items: ProductState[]): void {
  // Reset everything first so a partial URL doesn't leave stale values.
  for (const item of items) {
    if (item.input === 'toggle') item.value = false
    else item.value = 0
  }
  if (!str) return

  const map = new Map(items.map((i) => [i.id, i]))
  for (const part of str.split(',')) {
    if (!part) continue
    const [id, val] = part.split(':')
    const item = map.get(id)
    if (!item) continue
    if (item.input === 'toggle') {
      item.value = true
    } else {
      const n = Number(val)
      if (Number.isFinite(n) && n > 0) item.value = n
    }
  }
}

export function readFromUrl(items: ProductState[]): boolean {
  const hash = window.location.hash
  if (!hash || hash.length < 2) return false
  const params = new URLSearchParams(hash.slice(1))
  const raw = params.get(HASH_KEY)
  if (raw === null) return false
  decode(raw, items)
  return true
}

export function readFromStorage(items: ProductState[]): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return false
    decode(raw, items)
    return true
  } catch {
    return false
  }
}

export function writeToUrl(items: ProductState[]): void {
  const encoded = encode(items)
  const url = window.location.pathname + window.location.search + `#${HASH_KEY}=${encoded}`
  history.replaceState(null, '', url)
}

export function writeToStorage(items: ProductState[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, encode(items))
  } catch {
    // Quota exceeded or private mode — safe to ignore.
  }
}

export function clearStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}