export type SegmentId = 'uniclass' | 'personnalite'

export type PassoRule =
  | { type: 'fixed'; passos: number }
  | { type: 'perUnit'; divisor: number; multiplier: number; max: number }
  | { type: 'threshold'; thresholds: { upTo: number; passos: number }[] }
  | {
      type: 'tiered'
      tiers: { atLeast: number; passos: number }[]
      /** Optional human-readable summary shown in the comparison cards. */
      summary?: string
    }
  | { type: 'anyOf'; ids: string[]; passos: number }

type BaseDefinition = {
  id: string
  label: string
  segmentLabels?: Partial<Record<SegmentId, string>>
  rules: Partial<Record<SegmentId, PassoRule>>
}

export type ToggleDefinition = BaseDefinition & { input: 'toggle' }
export type NumberDefinition = BaseDefinition & { input: 'number'; unit?: string }

export type ProductDefinition = ToggleDefinition | NumberDefinition
export type ToggleState = ToggleDefinition & { value: boolean }
export type NumberState = NumberDefinition & { value: number }
export type ProductState = ToggleState | NumberState

export const products: ProductDefinition[] = [
  {
    id: 'debito-automatico',
    label: 'Débito Automático ativo',
    input: 'toggle',
    rules: {
      uniclass: { type: 'fixed', passos: 1 },
      personnalite: { type: 'fixed', passos: 1 }
    }
  },
  {
    id: 'pix',
    label: 'Chave Pix vinculada',
    input: 'toggle',
    rules: {
      uniclass: { type: 'fixed', passos: 1 },
      personnalite: { type: 'fixed', passos: 1 }
    }
  },
  {
    id: 'open-finance',
    label: 'Open Finance (1+ bancos vinculados)',
    input: 'toggle',
    rules: {
      uniclass: { type: 'fixed', passos: 1 },
      personnalite: { type: 'fixed', passos: 1 }
    }
  },
  {
    id: 'combinaqui',
    label: 'Combinaqui (1+ contratos)',
    input: 'toggle',
    rules: { uniclass: { type: 'fixed', passos: 1 } }
  },
  {
    id: 'conta-pj',
    label: 'Conta PJ ativa',
    input: 'toggle',
    rules: {
      uniclass: { type: 'fixed', passos: 1 },
      personnalite: { type: 'fixed', passos: 1 }
    }
  },
  {
    id: 'investimentos',
    label: 'Investimentos',
    input: 'number',
    unit: 'R$',
    rules: {
      uniclass: {
        type: 'tiered',
        summary: '1 passo por faixa de R$ 10 mil, a partir de R$ 50 mil · máx. 11',
        // 50k → +1, 60k → +1, …, 150k → +1. Total = 11.
        tiers: [
          { atLeast: 50_000,  passos: 1 },
          { atLeast: 60_000,  passos: 1 },
          { atLeast: 70_000,  passos: 1 },
          { atLeast: 80_000,  passos: 1 },
          { atLeast: 90_000,  passos: 1 },
          { atLeast: 100_000, passos: 1 },
          { atLeast: 110_000, passos: 1 },
          { atLeast: 120_000, passos: 1 },
          { atLeast: 130_000, passos: 1 },
          { atLeast: 140_000, passos: 1 },
          { atLeast: 150_000, passos: 1 }
        ]
      },
      personnalite: {
        type: 'tiered',
        summary: '2 + 2 + 4×6 + 16 passos por faixa cumulativa · máx. 44',
        // 0 → +2, 75k → +2, 150k → +4, 300k → +4, …, 900k → +4, 1.05mi → +16.
        // Total = 2+2+4+4+4+4+4+4+16 = 44.
        tiers: [
          { atLeast: 0,          passos: 2 },
          { atLeast: 75_000,     passos: 2 },
          { atLeast: 150_000,    passos: 4 },
          { atLeast: 300_000,    passos: 4 },
          { atLeast: 450_000,    passos: 4 },
          { atLeast: 600_000,    passos: 4 },
          { atLeast: 750_000,    passos: 4 },
          { atLeast: 900_000,    passos: 4 },
          { atLeast: 1_050_000,  passos: 16 }
        ]
      }
    }
  },
  {
    id: 'seguro-vida',
    label: 'Seguro de Vida ativo',
    input: 'toggle',
    rules: {
      uniclass: { type: 'fixed', passos: 2 },
      personnalite: { type: 'fixed', passos: 2 }
    }
  },
  {
    id: 'seguro-residencial',
    label: 'Seguro Residencial ativo',
    input: 'toggle',
    rules: {
      uniclass: { type: 'fixed', passos: 2 },
      personnalite: { type: 'fixed', passos: 2 }
    }
  },
  {
    id: 'seguro-auto',
    label: 'Seguro Auto ativo',
    input: 'toggle',
    rules: { personnalite: { type: 'fixed', passos: 2 } }
  },
  {
    id: 'cartao-credito',
    label: 'Gastos no Cartão de Crédito',
    input: 'number',
    unit: 'R$',
    rules: {
      uniclass: { type: 'perUnit', divisor: 2_000, multiplier: 2, max: 30 },
      personnalite: { type: 'perUnit', divisor: 5_000, multiplier: 2, max: 20 }
    }
  },
  {
    id: 'consorcio-imobiliario',
    label: 'Consórcio imobiliário',
    input: 'toggle',
    segmentLabels: {
      uniclass: 'Consórcio imobiliário ou de veículo'
    },
    rules: {
      // Uniclass: any consórcio (imobiliário OR veículo) = 2 passos, once.
      uniclass: {
        type: 'anyOf',
        ids: ['consorcio-imobiliario', 'consorcio-veiculo'],
        passos: 2
      },
      personnalite: { type: 'fixed', passos: 4 }
    }
  },
  {
    id: 'consorcio-veiculo',
    label: 'Consórcio de veículo',
    input: 'toggle',
    rules: { personnalite: { type: 'fixed', passos: 2 } }
  },
  {
    id: 'financiamento-veiculo',
    label: 'Financiamento de Veículos',
    input: 'toggle',
    rules: {
      uniclass: { type: 'fixed', passos: 2 },
      personnalite: { type: 'fixed', passos: 2 }
    }
  },
  {
    id: 'crediario-consignado',
    label: 'Crediário ou Consignado',
    input: 'toggle',
    rules: {
      uniclass: { type: 'fixed', passos: 2 },
      personnalite: { type: 'fixed', passos: 2 }
    }
  },
  {
    id: 'salario-inss',
    label: 'Salário ou INSS (líquido mensal recebido no Itaú)',
    input: 'number',
    unit: 'R$',
    segmentLabels: {
      personnalite: 'Salário, INSS ou CRM ativo'
    },
    rules: {
      uniclass: {
        type: 'threshold',
        thresholds: [
          { upTo: 5_000, passos: 5 },
          { upTo: Number.POSITIVE_INFINITY, passos: 10 }
        ]
      },
      personnalite: { type: 'anyOf', ids: ['salario-inss', 'crm'], passos: 4 }
    }
  },
  {
    id: 'crm',
    label: 'CRM ativo (Personnalité)',
    input: 'toggle',
    // No direct rules — it exists only to feed the Personnalité anyOf above.
    rules: {}
  },
  {
    id: 'financiamento-imobiliario',
    label: 'Financiamento Imobiliário',
    input: 'toggle',
    rules: {
      uniclass: { type: 'fixed', passos: 10 },
      personnalite: { type: 'fixed', passos: 4 }
    }
  }
]

export function toState(def: ProductDefinition): ProductState {
  if (def.input === 'toggle') return { ...def, value: false }
  return { ...def, value: 0 }
}