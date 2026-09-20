import type { PassoRule, ProductState } from './products'

export function computePassos(
  rule: PassoRule | undefined,
  value: boolean | number,
  allItems: ProductState[]
): number {
  if (!rule) return 0

  switch (rule.type) {
    case 'fixed':
      return value === true ? rule.passos : 0

    case 'perUnit': {
      const v = typeof value === 'number' ? value : 0
      if (v <= 0) return 0
      const units = Math.floor(v / rule.divisor)
      return Math.min(units * rule.multiplier, rule.max)
    }

    case 'threshold': {
      const v = typeof value === 'number' ? value : 0
      if (v <= 0) return 0
      for (const t of rule.thresholds) {
        if (v <= t.upTo) return t.passos
      }
      return 0
    }

    case 'tiered': {
      const v = typeof value === 'number' ? value : 0
      if (v <= 0) return 0
      return rule.tiers.reduce(
        (sum, t) => (v >= t.atLeast ? sum + t.passos : sum),
        0
      )
    }

    case 'anyOf': {
      const any = rule.ids.some((id) => {
        const item = allItems.find((i) => i.id === id)
        if (!item) return false
        return item.input === 'toggle' ? item.value === true : item.value > 0
      })
      return any ? rule.passos : 0
    }
  }
}

const brl = (n: number) => n.toLocaleString('pt-BR')

export function describeRule(rule: PassoRule | undefined): string | null {
  if (!rule) return null

  switch (rule.type) {
    case 'fixed': {
      const p = rule.passos === 1 ? 'passo' : 'passos'
      return `${rule.passos} ${p}`
    }

    case 'perUnit': {
      const p = rule.multiplier === 1 ? 'passo' : 'passos'
      return `${rule.multiplier} ${p} a cada R$ ${brl(rule.divisor)} (máx. ${rule.max})`
    }

    case 'threshold': {
      let prev = 0
      return rule.thresholds
        .map((t) => {
          const from = prev
          prev = t.upTo
          const p = t.passos === 1 ? 'passo' : 'passos'
          if (t.upTo === Number.POSITIVE_INFINITY) {
            return `acima de R$ ${brl(from)}: ${t.passos} ${p}`
          }
          if (from === 0) {
            return `até R$ ${brl(t.upTo)}: ${t.passos} ${p}`
          }
          return `R$ ${brl(from)} a R$ ${brl(t.upTo)}: ${t.passos} ${p}`
        })
        .join(' · ')
    }

    case 'tiered': {
      if (rule.summary) return rule.summary
      const total = rule.tiers.reduce((s, t) => s + t.passos, 0)
      return `faixas cumulativas · máx. ${total}`
    }

    case 'anyOf': {
      const p = rule.passos === 1 ? 'passo' : 'passos'
      return `${rule.passos} ${p} (qualquer produto vinculado ativo)`
    }
  }
}

export function maxPassosFor(rule: PassoRule | undefined): number {
  if (!rule) return 0
  switch (rule.type) {
    case 'fixed':
      return rule.passos
    case 'perUnit':
      return rule.max
    case 'threshold':
      return Math.max(...rule.thresholds.map((t) => t.passos))
    case 'tiered':
      return rule.tiers.reduce((s, t) => s + t.passos, 0)
    case 'anyOf':
      return rule.passos
  }
}

export function nextTarget(
  rule: PassoRule,
  value: number
): { target: number; gain: number } | null {
  switch (rule.type) {
    case 'perUnit': {
      const units = Math.max(0, Math.floor(value / rule.divisor))
      const currentPassos = Math.min(units * rule.multiplier, rule.max)
      if (currentPassos >= rule.max) return null
      const nextValue = (units + 1) * rule.divisor
      const gain = Math.min(rule.multiplier, rule.max - currentPassos)
      return { target: nextValue, gain }
    }

    case 'threshold': {
      // value = 0 is treated as "not set" → 0 passos. Any positive value
      // lands in the first band.
      if (value <= 0) {
        return { target: 1, gain: rule.thresholds[0].passos }
      }
      let currentPassos = 0
      for (const t of rule.thresholds) {
        if (value <= t.upTo) {
          currentPassos = t.passos
          break
        }
      }
      for (let i = 0; i < rule.thresholds.length; i++) {
        const t = rule.thresholds[i]
        if (t.passos > currentPassos) {
          const prevUpTo = i === 0 ? 0 : rule.thresholds[i - 1].upTo
          if (prevUpTo === Number.POSITIVE_INFINITY) return null
          return { target: prevUpTo + 1, gain: t.passos - currentPassos }
        }
      }
      return null
    }

    case 'tiered': {
      if (value <= 0) {
        return { target: 1, gain: rule.tiers[0]?.passos ?? 0 }
      }
      for (const t of rule.tiers) {
        if (value < t.atLeast) {
          return { target: t.atLeast, gain: t.passos }
        }
      }
      return null
    }

    case 'fixed':
    case 'anyOf':
      return null // toggles don't have a "next value"
  }
}