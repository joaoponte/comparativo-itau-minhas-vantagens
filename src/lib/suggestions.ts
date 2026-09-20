import type { ProductState, SegmentId } from './products'
import { computePassos, maxPassosFor, nextTarget } from './passos'

export type Suggestion = {
  itemId: string
  /** Label as shown for the current segment (respects segmentLabels overrides). */
  label: string
  /** How many passos this move would add. */
  delta: number
  action: 'toggle' | 'increase'
  /** For 'increase' actions: the value the user needs to enter. */
  target?: number
}

/**
 * Given a gap to the next level, returns up to 4 suggested moves that would
 * help close it. Toggles currently off come first (one-click), then number
 * bumps sorted by how many passos they unlock.
 */
export function suggestionsFor(
  items: ProductState[],
  segment: SegmentId,
  gap: number
): Suggestion[] {
  if (gap <= 0) return []

  const candidates: Suggestion[] = []

  for (const item of items) {
    const rule = item.rules[segment]
    if (!rule) continue

    const current = computePassos(rule, item.value, items)
    const max = maxPassosFor(rule)
    if (max <= current) continue

    const label = item.segmentLabels?.[segment] ?? item.label

    if (item.input === 'toggle') {
      candidates.push({
        itemId: item.id,
        label,
        delta: max - current,
        action: 'toggle'
      })
    } else {
      const next = nextTarget(rule, item.value as number)
      if (!next) continue
      candidates.push({
        itemId: item.id,
        label,
        delta: next.gain,
        action: 'increase',
        target: next.target
      })
    }
  }

  // Toggles first (easier), then larger gains first.
  candidates.sort((a, b) => {
    if (a.action !== b.action) return a.action === 'toggle' ? -1 : 1
    return b.delta - a.delta
  })

  // Greedily accumulate until the gap closes, capped at 4 items.
  const picked: Suggestion[] = []
  let remaining = gap
  for (const c of candidates) {
    if (picked.length >= 4) break
    picked.push(c)
    remaining -= c.delta
    if (remaining <= 0) break
  }
  return picked
}