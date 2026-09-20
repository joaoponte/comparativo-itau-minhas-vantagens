/**
 * Brand slug → logo URL.
 * Clearbit is used as a placeholder; swap any entry for a local path
 * (e.g. '/logos/evino.svg') once you drop real assets in /public/logos.
 */
export const logos: Record<string, string> = {
  'ze-delivery':  'https://logo.clearbit.com/zedelivery.com.br',
  evino:          'https://logo.clearbit.com/evino.com.br',
  outback:        'https://logo.clearbit.com/outback.com.br',
  'itau-shop':    'https://logo.clearbit.com/itaushop.com.br',
  youtube:        'https://logo.clearbit.com/youtube.com',
  google:         'https://logo.clearbit.com/google.com',
  localiza:       'https://logo.clearbit.com/localiza.com',
  movida:         'https://logo.clearbit.com/movida.com.br',
  smartfit:       'https://logo.clearbit.com/smartfit.com.br',
  'buddha-spa':   'https://logo.clearbit.com/buddhaspa.com.br',
  'airport-park': 'https://logo.clearbit.com/airportpark.com.br',
  casacor:        'https://logo.clearbit.com/casacor.com.br',
  uber:           'https://logo.clearbit.com/uber.com',
  netflix:        'https://logo.clearbit.com/netflix.com',
  shellbox:       'https://logo.clearbit.com/shellbox.com.br',
  mcdonalds:      'https://logo.clearbit.com/mcdonalds.com.br',
  biscoite:       'https://logo.clearbit.com/biscoite.com.br',
  'tag-itau':     'https://logo.clearbit.com/tagitau.com.br',
  'bike-itau':    'https://logo.clearbit.com/bikeitau.com.br',
  itau:           'https://logo.clearbit.com/itau.com.br',
  fasano:         'https://logo.clearbit.com/fasano.com.br',
  lacoste:        'https://logo.clearbit.com/lacoste.com',
  'grand-cru':    'https://logo.clearbit.com/grandcru.com.br'
}

export function logoUrl(slug: string): string | undefined {
  return logos[slug]
}