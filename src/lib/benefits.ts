export type Level = 1 | 2 | 3 | 4 | 5

export type LevelRange = { level: Level; min: number; max?: number }

export const uniclassLevelRanges: LevelRange[] = [
  { level: 1, min: 0, max: 3 },
  { level: 2, min: 4, max: 9 },
  { level: 3, min: 10, max: 15 },
  { level: 4, min: 16, max: 29 },
  { level: 5, min: 30 }
]

export const personnaliteLevelRanges: LevelRange[] = [
  { level: 1, min: 0, max: 3 },
  { level: 2, min: 4, max: 11 },
  { level: 3, min: 12, max: 19 },
  { level: 4, min: 20, max: 43 },
  { level: 5, min: 44 }
]

export function levelFor(passos: number, ranges: LevelRange[]): Level {
  for (const r of ranges) {
    if (passos >= r.min && (r.max === undefined || passos <= r.max)) return r.level
  }
  return 5
}

export type NextLevelInfo = {
  /** 0–100. Rounded to a whole number for display. */
  progress: number
  nextLevel: Level | null
  /** Passos still needed to reach `nextLevel`. */
  gap: number
}

export function nextLevelInfo(
  passos: number,
  ranges: LevelRange[]
): NextLevelInfo {
  for (let i = 0; i < ranges.length; i++) {
    const r = ranges[i]
    const inRange = passos >= r.min && (r.max === undefined || passos <= r.max)
    if (!inRange) continue

    // Top of the ladder.
    if (i === ranges.length - 1) {
      return { progress: 100, nextLevel: null, gap: 0 }
    }

    const next = ranges[i + 1]
    const span = next.min - r.min
    const progress = span > 0 ? ((passos - r.min) / span) * 100 : 100
    return {
      progress: Math.min(100, Math.max(0, Math.round(progress))),
      nextLevel: next.level,
      gap: next.min - passos
    }
  }
  return { progress: 100, nextLevel: null, gap: 0 }
}

export type BenefitCategory =
  | 'economia'
  | 'assinatura'
  | 'cupom'
  | 'desconto'
  | 'servico'

export const categoryMeta: Record<
  BenefitCategory,
  { label: string; layout: 'list' | 'grid'; accent: string }
> = {
  economia:   { label: 'Isenções e economia',       layout: 'list', accent: 'bg-emerald-500' },
  assinatura: { label: 'Assinaturas digitais',      layout: 'grid', accent: 'bg-violet-500'  },
  cupom:      { label: 'Cupons e vouchers',         layout: 'grid', accent: 'bg-rose-500'    },
  desconto:   { label: 'Descontos em parceiros',    layout: 'grid', accent: 'bg-orange-500'  },
  servico:    { label: 'Serviços e experiências',   layout: 'list', accent: 'bg-slate-400'   }
}

/** Display order inside a segment card. */
export const categoryOrder: BenefitCategory[] = [
  'economia',
  'assinatura',
  'cupom',
  'desconto',
  'servico'
]

export type Benefit = {
  family: string
  label: string
  minLevel: Level
  maxLevel?: Level
  category: BenefitCategory
  /** Single brand slug — looks up the logo. */
  brand?: string
  /** Multiple brand slugs — renders up to 3 small overlapping logos. */
  brands?: string[]
  /** Sub-accordion with bullet list (e.g. "escolha um cupom"). */
  options?: string[]
  /** Rendered with extra emphasis. */
  highlight?: boolean
}

export const uniclassBenefits: Benefit[] = [
  // ───────────── Level 1 ─────────────
  {
    family: 'anuidade-cartoes',
    label: 'Cartão Visa Signature sem anuidade (sem programa de pontos)',
    minLevel: 1,
    maxLevel: 2,
    category: 'economia',
    brand: 'itau'
  },
  {
    family: 'gerente-dedicado',
    label: 'Gerente dedicado e especialista pelo WhatsApp',
    minLevel: 1,
    category: 'servico'
  },
  {
    family: 'cashback-parceiros',
    label: 'Cashback em lojas parceiras',
    minLevel: 1,
    category: 'economia'
  },
  {
    family: 'limite-sem-juros',
    label: '10 dias sem juros no Limite da Conta',
    minLevel: 1,
    category: 'economia'
  },
  {
    family: 'youtube-premium',
    label: 'YouTube Premium por 3 meses (usuários novos ou não assinantes nos últimos 3 anos)',
    minLevel: 1,
    category: 'assinatura',
    brand: 'youtube'
  },
  {
    family: 'google-ai',
    label: 'Google AI Plus (Gemini e Gemini Omni) — 3 meses grátis no ano',
    minLevel: 1,
    maxLevel: 1,
    category: 'assinatura',
    brand: 'google'
  },
  {
    family: 'ze-delivery',
    label: 'Cupom de R$ 10,00 em compras acima de R$ 100,00 no app Zé Delivery',
    minLevel: 1,
    category: 'cupom',
    brand: 'ze-delivery'
  },
  {
    family: 'cafe-biscoite',
    label: 'Um café por mês no Biscoitê do Espaço Uniclass (Av. Paulista, 329, São Paulo-SP)',
    minLevel: 1,
    maxLevel: 3,
    category: 'cupom',
    brand: 'biscoite'
  },

  // ───────────── Level 2 ─────────────
  {
    family: 'tag-itau',
    label: 'Tag Itaú para estacionamento e pedágio sem mensalidade — até 2 tags sem mensalidade por CPF',
    minLevel: 2,
    category: 'servico',
    brand: 'tag-itau'
  },
  {
    family: 'evino',
    label: 'Cupom de R$ 30,00 para compras acima de R$ 100,00 no Evino pelo Itaú Shop',
    minLevel: 2,
    maxLevel: 3,
    category: 'cupom',
    brand: 'evino'
  },
  {
    family: 'outback-cupom',
    label: "Cupom de Chocolate Thunder ou Bloomin' Onion no Outback",
    minLevel: 2,
    category: 'cupom',
    brand: 'outback'
  },
  {
    family: 'bike-itau',
    label: '2 viagens avulsas de até 15 minutos no Bike Itaú',
    minLevel: 2,
    category: 'servico',
    brand: 'bike-itau'
  },
  {
    family: 'aluguel-carro',
    label: '10% de desconto no Localiza ou 12% de desconto no Movida — 1x no mês',
    minLevel: 2,
    category: 'desconto',
    brands: ['localiza', 'movida']
  },
  {
    family: 'google-ai',
    label: 'Google AI Pro (Gemini e Gemini Omni) — 6 meses grátis no ano',
    minLevel: 2,
    maxLevel: 4,
    category: 'assinatura',
    brand: 'google'
  },

  // ───────────── Level 3 ─────────────
  {
    family: 'anuidade-cartoes',
    label: 'Anuidade gratuita: Visa Signature e Mastercard Platinum+ (com programa de pontos)',
    minLevel: 3,
    maxLevel: 3,
    category: 'economia',
    brand: 'itau'
  },
  {
    family: 'isencao-pacote',
    label: 'Isenção no pacote de serviços da conta corrente',
    minLevel: 3,
    category: 'economia',
    highlight: true
  },
  {
    family: 'smartfit',
    label: 'R$ 20,00 de desconto na mensalidade do plano Black da SmartFit (1x, apenas para contratação de novo plano)',
    minLevel: 3,
    category: 'desconto',
    brand: 'smartfit'
  },
  {
    family: 'credito-imobiliario',
    label: 'Taxas especiais de crédito imobiliário — apenas novos contratos',
    minLevel: 3,
    category: 'economia'
  },
  {
    family: 'pontos-cartao',
    label: 'Mais pontos nos cartões Mastercard Black e Visa Infinite — de 1.8 para 2.0 pontos por dólar',
    minLevel: 3,
    category: 'economia'
  },
  {
    family: 'itau-shop-mensal',
    label: 'Cupom de R$ 20,00 todo mês no Itaú Shop em compras acima de R$ 50,00',
    minLevel: 3,
    category: 'cupom',
    brand: 'itau-shop'
  },
  {
    family: 'buddha-spa',
    label: 'Desconto de 12% no Buddha Spa',
    minLevel: 3,
    category: 'desconto',
    brand: 'buddha-spa'
  },

  // ───────────── Level 4 ─────────────
  {
    family: 'anuidade-cartoes',
    label: 'Anuidade gratuita: Visa Signature, Mastercard Platinum+, Mastercard Black e Visa Infinite',
    minLevel: 4,
    category: 'economia',
    brand: 'itau'
  },
  {
    family: 'cupom-escolha',
    label: 'Escolha um cupom da lista',
    minLevel: 4,
    maxLevel: 4,
    category: 'cupom',
    brands: ['uber', 'itau-shop', 'shellbox', 'outback', 'mcdonalds'],
    options: [
      'Voucher de R$ 20 para utilizar na Uber',
      'R$ 35 para utilizar no Itaú Shop',
      'R$ 20 para utilizar no ShellBox',
      'R$ 40 para utilizar no Outback',
      'Resgatar Mc Dia Feliz (1 Big Mac) ou 1 Cheddar McMelt'
    ]
  },
  {
    family: 'evino',
    label: 'Cupom de R$ 40,00 para compras acima de R$ 100,00 no Evino pelo Itaú Shop',
    minLevel: 4,
    category: 'cupom',
    brand: 'evino'
  },
  {
    family: 'airport-park',
    label: '30% nas diárias no Airport Park em Guarulhos',
    minLevel: 4,
    category: 'desconto',
    brand: 'airport-park'
  },
  {
    family: 'credito-investidores',
    label: '5% de desconto na taxa no Crédito para Investidores',
    minLevel: 4,
    maxLevel: 4,
    category: 'economia'
  },
  {
    family: 'cafe-biscoite',
    label: '4 cafés por mês no Biscoitê do Espaço Uniclass — 1 café por semana',
    minLevel: 4,
    category: 'cupom',
    brand: 'biscoite'
  },

  // ───────────── Level 5 ─────────────
  {
    family: 'cupom-escolha',
    label: 'Escolha um cupom da lista',
    minLevel: 5,
    category: 'cupom',
    brands: ['netflix', 'itau', 'uber', 'itau-shop', 'shellbox', 'outback', 'mcdonalds'],
    options: [
      'Voucher de R$ 35 para utilizar na Netflix',
      '1.000 Pontos Itaú',
      'R$ 25 para utilizar na Uber',
      'R$ 45 para utilizar no Itaú Shop',
      'R$ 25 para utilizar no Shell Box',
      'R$ 50 para utilizar no Outback',
      'Resgatar 1 McOferta McChicken ou Mc Dia Feliz (1 Big Mac)'
    ]
  },
  {
    family: 'salas-vip',
    label: '4 acessos cortesia em salas VIP pelos cartões Mastercard Black e/ou Visa Infinite Uniclass (última fatura > R$ 0,00)',
    minLevel: 5,
    category: 'servico'
  },
  {
    family: 'credito-investidores',
    label: '10% de desconto na taxa no Crédito para Investidores',
    minLevel: 5,
    category: 'economia'
  },
  {
    family: 'google-ai',
    label: 'Google AI Pro (Gemini e Gemini Omni) — 12 meses grátis no ano',
    minLevel: 5,
    category: 'assinatura',
    brand: 'google'
  }
]

export const personnaliteBenefits: Benefit[] = [
  // ───────────── Level 1 ─────────────
  {
    family: 'youtube-premium',
    label: 'YouTube Premium grátis por 6 meses (apenas novos usuários, sem assinatura ativa e que não tenham sido assinantes nos últimos 36 meses)',
    minLevel: 1,
    category: 'assinatura',
    brand: 'youtube'
  },
  {
    family: 'google-ai',
    label: 'Google AI Plus (Gemini e Gemini Omni inclusos) — 3 meses grátis por ano',
    minLevel: 1,
    maxLevel: 1,
    category: 'assinatura',
    brand: 'google'
  },
  {
    family: 'casacor',
    label: '20% de desconto nos ingressos CASACOR 2026 — até 2 ingressos',
    minLevel: 1,
    maxLevel: 4,
    category: 'desconto',
    brand: 'casacor'
  },
  {
    family: 'limite-sem-juros',
    label: '10 dias sem juros no Limite da Conta',
    minLevel: 1,
    category: 'economia'
  },
  {
    family: 'corretagem-pf',
    label: 'Taxa zero de corretagem — renda variável, renda fixa, fundos imobiliários, tesouro direto e previdência',
    minLevel: 1,
    category: 'economia'
  },
  {
    family: 'tag-itau',
    label: 'Tag Itaú sem mensalidade — até 4 tags livres de mensalidade',
    minLevel: 1,
    category: 'servico',
    brand: 'tag-itau'
  },
  {
    family: 'valet-itau',
    label: 'Valet Itaú Personnalité — estacionamento com manobrista no aeroporto de Guarulhos (diárias cobradas à parte)',
    minLevel: 1,
    category: 'servico',
    brand: 'itau'
  },
  {
    family: 'menu-personnalite',
    label: 'Menu Personnalité',
    minLevel: 1,
    category: 'servico'
  },
  {
    family: 'fasano',
    label: 'Parceria Personnalité e Fasano — Hotéis: tarifa exclusiva, welcome drink, early check-in e late check-out; Restaurantes: 15% de desconto em dias e restaurantes selecionados',
    minLevel: 1,
    maxLevel: 4,
    category: 'servico',
    brand: 'fasano'
  },
  {
    family: 'experiencia-personnalite',
    label: 'Experiência Personnalité — benefícios em Esporte, Viagem, Gastronomia, Saúde e Bem-estar, Moda e mais',
    minLevel: 1,
    category: 'servico'
  },

  // ───────────── Level 2 ─────────────
  {
    family: 'anuidade-cartoes',
    label: 'Anuidade gratuita nos cartões Mastercard Black e Visa Infinite do Personnalité',
    minLevel: 2,
    category: 'economia',
    brand: 'itau'
  },
  {
    family: 'isencao-tarifa-pf',
    label: 'Isenção de tarifa da conta corrente de Pessoa Física',
    minLevel: 2,
    category: 'economia',
    highlight: true
  },
  {
    family: 'google-ai',
    label: 'Google AI Plus (Gemini e Gemini Omni inclusos) — 12 meses grátis por ano',
    minLevel: 2,
    maxLevel: 5,
    category: 'assinatura',
    brand: 'google'
  },

  // ───────────── Level 3 ─────────────
  {
    family: 'cupom-escolha',
    label: 'Escolha um benefício da lista',
    minLevel: 3,
    maxLevel: 3,
    category: 'cupom',
    brands: ['lacoste', 'itau', 'uber'],
    options: [
      'R$ 50,00 de crédito e frete grátis para produtos Lacoste no Itaú Shop',
      '1.000 pontos Itaú para usar no Itaú Shop, transferir para companhias aéreas, desconto em fatura e muito mais',
      'R$ 25,00 de crédito para viagens com a Uber',
      '1 ingresso de Cinema'
    ]
  },
  {
    family: 'frete-gratis-itau-shop',
    label: 'Frete grátis em todas as compras no Itaú Shop — cupom MVPERSONFRETE, uso ilimitado, não cumulativo com outros cupons',
    minLevel: 3,
    category: 'cupom',
    brand: 'itau-shop'
  },
  {
    family: 'credito-investidores',
    label: '5% de desconto na taxa de contratação de Crédito para Investidores',
    minLevel: 3,
    maxLevel: 3,
    category: 'economia'
  },

  // ───────────── Level 4 ─────────────
  {
    family: 'credito-investidores',
    label: '10% de desconto na taxa de contratação de Crédito para Investidores',
    minLevel: 4,
    maxLevel: 4,
    category: 'economia'
  },
  {
    family: 'cupom-escolha',
    label: 'Escolha um benefício da lista',
    minLevel: 4,
    maxLevel: 4,
    category: 'cupom',
    brands: ['lacoste', 'itau-shop', 'uber'],
    options: [
      'R$ 100,00 em créditos no Itaú Shop para produtos Lacoste',
      'Cupom de R$ 70,00 e frete grátis em vinhos Grand Cru no Itaú Shop',
      'R$ 35,00 de crédito para viagens com a Uber',
      '1.400 pontos Itaú Shop',
      '1 par de ingressos de cinema'
    ]
  },
  {
    family: 'corretagem-pj',
    label: 'Taxa zero de corretagem — isenção da mensalidade para contas PJ Adapt ou Itaú Empresas',
    minLevel: 4,
    category: 'economia'
  },
  {
    family: 'credito-imobiliario',
    label: 'Taxas diferenciadas de Crédito Imobiliário',
    minLevel: 4,
    category: 'economia'
  },

  // ───────────── Level 5 ─────────────
  {
    family: 'credito-investidores',
    label: '15% de desconto na taxa de contratação de Crédito para Investidores',
    minLevel: 5,
    category: 'economia'
  },
  {
    family: 'the-one',
    label: 'Isenção de anuidade no cartão Itaú The One',
    minLevel: 5,
    category: 'economia',
    brand: 'itau'
  },
  {
    family: 'cupom-escolha',
    label: 'Escolha um benefício da lista',
    minLevel: 5,
    category: 'cupom',
    brands: ['lacoste', 'grand-cru', 'uber'],
    options: [
      'R$ 120,00 em créditos no Itaú Shop para produtos Lacoste',
      'Cupom de R$ 70,00 e frete grátis em vinhos Grand Cru no Itaú Shop',
      'R$ 35,00 de crédito para viagens com a Uber',
      '1.400 pontos Itaú Shop',
      '1 par de ingressos de cinema'
    ]
  },
  {
    family: 'casacor',
    label: '1 par de ingressos para CASACOR São Paulo 2026',
    minLevel: 5,
    category: 'desconto',
    brand: 'casacor'
  },
  {
    family: 'dolar-euro',
    label: 'Dólar e Euro com condições especiais para compras no App+',
    minLevel: 5,
    category: 'economia'
  },
  {
    family: 'fasano',
    label: 'Parceria Personnalité e Fasano — Hotéis: tarifa exclusiva, welcome drink, early check-in e late check-out, massagem relaxante de 50 minutos por apartamento, acesso à piscina de surf no Boa Vista Surf Lodge (surf ou aulas cobrados à parte); Restaurantes: 15% de desconto em dias e restaurantes selecionados, taxa rolha cortesia (1 por mesa), couvert cortesia para o portador do cartão, birthday menu exclusivamente na data do aniversário mediante dias e horários selecionados disponíveis para reserva prévia',
    minLevel: 5,
    category: 'servico',
    brand: 'fasano'
  }
]

export function benefitsForLevel(level: Level, all: Benefit[]): Benefit[] {
  return all.filter(
    (b) => b.minLevel <= level && (b.maxLevel === undefined || level <= b.maxLevel)
  )
}