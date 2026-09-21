<script lang="ts">
  import { products, toState, type ProductState, type SegmentId } from './lib/products'
  import { computePassos, describeRule } from './lib/passos'
  import {
    benefitsForLevel,
    levelFor,
    nextLevelInfo,
    categoryMeta,
    categoryOrder,
    uniclassBenefits,
    personnaliteBenefits,
    uniclassLevelRanges,
    personnaliteLevelRanges,
    type Benefit,
    type Level,
    type LevelRange
  } from './lib/benefits'
  import { suggestionsFor, type Suggestion } from './lib/suggestions'
  import { logoUrl } from './lib/logos'
  import {
    readFromUrl,
    readFromStorage,
    writeToUrl,
    writeToStorage,
    clearStorage,
    encode
  } from './lib/persistence'
  import MoneyInput from './lib/MoneyInput.svelte'
  import ProgramInfo from './lib/ProgramInfo.svelte'
  import { onDestroy } from 'svelte'

  let items: ProductState[] = $state(products.map(toState))

  if (!readFromUrl(items)) {
    readFromStorage(items)
  }

  const toggles = $derived(items.filter((i) => i.input === 'toggle'))
  const numbers = $derived(items.filter((i) => i.input === 'number'))

  const segments: {
    id: SegmentId
    label: string
    border: string
    text: string
    badge: string
    benefits: Benefit[]
    levelRanges: LevelRange[]
  }[] = [
    {
      id: 'uniclass',
      label: 'Uniclass',
      border: 'border-blue-500',
      text: 'text-blue-700 dark:text-blue-400',
      badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
      benefits: uniclassBenefits,
      levelRanges: uniclassLevelRanges
    },
    {
      id: 'personnalite',
      label: 'Personnalité',
      border: 'border-amber-500',
      text: 'text-amber-700 dark:text-amber-400',
      badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
      benefits: personnaliteBenefits,
      levelRanges: personnaliteLevelRanges
    }
  ]

  let activeTab = $state<SegmentId>('uniclass')

  function contributesTo(item: ProductState, segment: SegmentId): boolean {
    if (item.rules[segment]) return true
    return items.some((other) => {
      const r = other.rules[segment]
      return r?.type === 'anyOf' && r.ids.includes(item.id)
    })
  }

  const dotsFor = $derived(
    Object.fromEntries(
      items.map((item) => [
        item.id,
        segments.filter((s) => contributesTo(item, s.id)).map((s) => s.id)
      ])
    ) as Record<string, SegmentId[]>
  )

  function groupBenefits(benefits: Benefit[]) {
    return categoryOrder
      .map((cat) => ({
        category: cat,
        meta: categoryMeta[cat],
        items: benefits.filter((b) => b.category === cat)
      }))
      .filter((g) => g.items.length > 0)
  }

  function brandSlugs(b: Benefit): string[] {
    if (b.brands?.length) return b.brands
    if (b.brand) return [b.brand]
    return []
  }

  const segmentData = $derived(
    segments.map((s) => {
      const segItems = items
        .filter((i) => i.rules[s.id] !== undefined)
        .map((i) => ({
          id: i.id,
          label: i.segmentLabels?.[s.id] ?? i.label,
          rule: describeRule(i.rules[s.id]),
          contribution: computePassos(i.rules[s.id], i.value, items)
        }))
      const total = segItems.reduce((sum, x) => sum + x.contribution, 0)
      const level = levelFor(total, s.levelRanges)
      const activeBenefits = benefitsForLevel(level, s.benefits)
      const nli = nextLevelInfo(total, s.levelRanges)
      const suggestions = nli.nextLevel
        ? suggestionsFor(items, s.id, nli.gap)
        : []
      return {
        ...s,
        items: segItems,
        total,
        level,
        groups: groupBenefits(activeBenefits),
        progress: nli.progress,
        nextLevel: nli.nextLevel,
        gap: nli.gap,
        suggestions
      }
    })
  )

  let justLeveledUp = $state<Record<SegmentId, boolean>>({
    uniclass: false,
    personnalite: false
  })

  const levelWatcher = $effect.root(() => {
    for (const s of segments) {
      let prev: number | null = null
      $effect(() => {
        const lvl = segmentData.find((d) => d.id === s.id)!.level
        if (prev !== null && prev !== lvl) {
          justLeveledUp[s.id] = true
          const t = setTimeout(() => (justLeveledUp[s.id] = false), 1400)
          return () => clearTimeout(t)
        }
        prev = lvl
      })
    }
  })

  function applySuggestion(s: Suggestion) {
    const item = items.find((i) => i.id === s.itemId)
    if (!item) return
    if (s.action === 'toggle') {
      item.value = true
    } else if (s.action === 'increase' && s.target !== undefined) {
      item.value = s.target
    }
  }

  const brl = (n: number) => n.toLocaleString('pt-BR')

  function formatAction(s: Suggestion): string {
    if (s.action === 'toggle') return `Ativar ${s.label}`
    return `Aumentar ${s.label} para R$ ${brl(s.target ?? 0)}`
  }

  let urlTimer: ReturnType<typeof setTimeout> | undefined

  $effect(() => {
    void items.map((i) => i.value)
    writeToStorage(items)
    clearTimeout(urlTimer)
    urlTimer = setTimeout(() => writeToUrl(items), 300)
    return () => clearTimeout(urlTimer)
  })

  function resetAll() {
    for (const item of items) {
      if (item.input === 'toggle') item.value = false
      else item.value = 0
    }
    clearStorage()
  }

  // ─────────── Print ───────────

  function handlePrint() {
    const originalTitle = document.title
    const filename = `Comparativo Minhas Vantagens - ${new Date()
      .toISOString()
      .slice(0, 10)}`
    document.title = filename
    window.print()
    document.title = originalTitle
  }

  // Open every <details> before print so the whole document is visible,
  // then restore the original state afterwards. Works for the button and
  // for Ctrl/Cmd+P.
  if (typeof window !== 'undefined') {
    let savedDetailsState: boolean[] = []

    const beforePrint = () => {
      const all = Array.from(document.querySelectorAll('details'))
      savedDetailsState = all.map((d) => d.open)
      all.forEach((d) => (d.open = true))
    }

    const afterPrint = () => {
      const all = Array.from(document.querySelectorAll('details'))
      all.forEach((d, i) => (d.open = savedDetailsState[i] ?? false))
    }

    window.addEventListener('beforeprint', beforePrint)
    window.addEventListener('afterprint', afterPrint)

    onDestroy(() => {
      window.removeEventListener('beforeprint', beforePrint)
      window.removeEventListener('afterprint', afterPrint)
    })
  }

  // Current shareable URL — recomputed whenever any value changes.
  const printUrl = $derived.by(() => {
    void items.map((i) => i.value)
    if (typeof window === 'undefined') return ''
    const encoded = encode(items)
    return `${window.location.origin}${window.location.pathname}#c=${encoded}`
  })

  const printDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
</script>

<main class="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-8 transition-colors">
  <div class="flex items-start justify-between gap-4 mb-6 sm:mb-8 print:hidden">
    <h1 class="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">
      Comparador de Benefícios
    </h1>
    <button
      type="button"
      onclick={handlePrint}
      class="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
            bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200
            border border-slate-200 dark:border-slate-800
            hover:bg-slate-50 dark:hover:bg-slate-800
            transition-colors cursor-pointer shrink-0"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
          class="w-4 h-4" aria-hidden="true">
        <path fill-rule="evenodd" d="M5 2.75C5 1.784 5.784 1 6.75 1h6.5c.966 0 1.75.784 1.75 1.75v3.552c.377.046.752.097 1.126.153A2.212 2.212 0 0 1 18 8.653v4.097A2.25 2.25 0 0 1 15.75 15h-.241l.305 1.984A1.75 1.75 0 0 1 14.084 19H5.915a1.75 1.75 0 0 1-1.73-2.016L4.492 15H4.25A2.25 2.25 0 0 1 2 12.75V8.653c0-1.082.775-2.034 1.874-2.198.374-.056.75-.107 1.126-.153V2.75Zm7.75 0v3.276a49.31 49.31 0 0 0-2.5-.03V2.75h2.5ZM10 10.5a.75.75 0 0 1 .75.75v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 .75-.75Zm-4.75 5.45.286-1.86c.42.062.845.11 1.274.14a4.526 4.526 0 0 0 1.227.063c.31-.02.622-.058.933-.11v1.767H5.25Zm9.5 0v-1.767c.311.052.622.09.933.11.414.027.825.006 1.227-.063.43-.03.855-.078 1.274-.14l.286 1.86H14.75Z" clip-rule="evenodd" />
      </svg>
      <span class="hidden sm:inline">Imprimir / PDF</span>
      <span class="sm:hidden">PDF</span>
    </button>
  </div>

  <!-- Print-only summary header -->
  <div class="hidden print:block mb-6 pb-4 border-b border-slate-300">
    <h1 class="text-xl font-bold mb-1">
      Comparador de Benefícios — Itaú Uniclass vs. Personnalité
    </h1>
    <p class="text-xs text-slate-500 mb-3">Gerado em {printDate}</p>

    <div class="flex gap-8 text-sm">
      {#each segmentData as seg (seg.id)}
        <div>
          <strong>{seg.label}:</strong>
          Nível {seg.level} · {seg.total} {seg.total === 1 ? 'passo' : 'passos'}
        </div>
      {/each}
    </div>

    {#if printUrl}
      <p class="text-[10px] text-slate-400 mt-3 break-all leading-tight">
        {printUrl}
      </p>
    {/if}
  </div>

  <!-- SECTION 1: Products -->
  <section class="print-products mb-10 bg-white dark:bg-slate-900 rounded-lg shadow p-5 sm:p-6 space-y-8 transition-colors">
    <div>
      <h2 class="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-1">Produtos</h2>
      <p class="text-xs text-slate-500 dark:text-slate-400 italic mb-4">
        Benefícios do programa <strong class="not-italic">Minhas Vantagens</strong> do Itaú,
        liberados conforme você acumula passos em cada segmento.
      </p>
      <div class="flex items-start justify-between gap-4">
        <div class="flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500">
          <span class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-blue-500"></span> Uniclass
          </span>
          <span class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-amber-500"></span> Personnalité
          </span>
        </div>
        <button
          type="button"
          onclick={resetAll}
          class="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200
                 underline underline-offset-2 cursor-pointer transition-colors shrink-0 print:hidden"
        >
          Limpar tudo
        </button>
      </div>
    </div>

    {#snippet dots(segmentIds: SegmentId[])}
      <span class="flex items-center gap-1 shrink-0">
        {#each segmentIds as id}
          <span class="w-2 h-2 rounded-full {id === 'uniclass' ? 'bg-blue-500' : 'bg-amber-500'}"></span>
        {/each}
      </span>
    {/snippet}

    <!-- Toggles -->
    <div>
      <h3 class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
        Ativações
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
        {#each toggles as item (item.id)}
          <label class="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              bind:checked={item.value}
              class="w-5 h-5 accent-blue-600 shrink-0"
            />
            <span class="text-slate-700 dark:text-slate-200">{item.label}</span>
            {@render dots(dotsFor[item.id])}
          </label>
        {/each}
      </div>
    </div>

    <!-- Numbers -->
    <div>
      <h3 class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
        Valores informados
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        {#each numbers as item (item.id)}
          <div class="flex items-center gap-3">
            <div class="flex-1 flex items-center gap-2 min-w-0">
              <span class="text-slate-700 dark:text-slate-200">{item.label}</span>
              {@render dots(dotsFor[item.id])}
            </div>
            <MoneyInput bind:value={item.value} />
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- SECTION 2: Comparison -->
  <section class="print-comparison">
    <h2 class="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-4 print-hide-heading">
      Comparação
    </h2>

    <!-- Mobile tabs (hidden on md+) -->
    <div class="md:hidden flex gap-2 mb-4 print:hidden">
      {#each segments as s (s.id)}
        <button
          type="button"
          onclick={() => (activeTab = s.id)}
          class="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer
                 {activeTab === s.id
                   ? s.id === 'uniclass'
                     ? 'bg-blue-500 text-white shadow'
                     : 'bg-amber-500 text-white shadow'
                   : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'}"
        >
          {s.label}
        </button>
      {/each}
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      {#each segmentData as segment (segment.id)}
        <article
          class="segment-card {segment.id === activeTab ? 'flex' : 'hidden'} md:flex
                 bg-white dark:bg-slate-900 rounded-lg shadow border-t-4 {segment.border}
                 flex-col
                 dark:ring-1 dark:ring-slate-800 transition-colors"
        >
          <header class="px-5 sm:px-6 pt-5 sm:pt-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-2">
                <h3 class="text-lg font-bold {segment.text}">{segment.label}</h3>
                <span class="px-2 py-0.5 rounded-full text-xs font-semibold {segment.badge}">
                  Nível {segment.level}
                </span>
              </div>
              <div class="flex items-baseline gap-2">
                <span class="text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 hidden sm:inline">
                  Total de passos
                </span>
                <span class="text-3xl font-bold {segment.text} tabular-nums leading-none">
                  {segment.total}
                </span>
              </div>
            </div>

            <div class="space-y-1">
              <div class="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  class="h-full {segment.id === 'uniclass' ? 'bg-blue-500' : 'bg-amber-500'}
                         transition-all duration-500 ease-out rounded-full"
                  style="width: {segment.progress}%"
                ></div>
              </div>
              <div class="flex justify-between text-[10px] text-slate-400 dark:text-slate-500">
                <span>Nível {segment.level}</span>
                {#if segment.nextLevel}
                  <span>
                    Nível {segment.nextLevel} em {segment.gap}
                    {segment.gap === 1 ? 'passo' : 'passos'}
                  </span>
                {:else}
                  <span>Nível máximo</span>
                {/if}
              </div>
            </div>
          </header>

          {#if segment.nextLevel && segment.suggestions.length > 0}
            <div class="border-b border-slate-100 dark:border-slate-800 px-5 sm:px-6 py-3
                        bg-amber-50/60 dark:bg-amber-950/30">
              <div class="flex items-center justify-between mb-2">
                <span class="text-[10px] font-semibold text-amber-800 dark:text-amber-200 uppercase tracking-wider">
                  Como chegar ao Nível {segment.nextLevel}
                </span>
                <span class="text-[10px] text-amber-700 dark:text-amber-300 tabular-nums">
                  faltam {segment.gap} {segment.gap === 1 ? 'passo' : 'passos'}
                </span>
              </div>
              <ul class="space-y-0.5">
                {#each segment.suggestions as s (s.itemId)}
                  <li>
                    <button
                      type="button"
                      onclick={() => applySuggestion(s)}
                      class="w-full flex items-center justify-between gap-2 text-left text-sm
                             rounded px-2 py-1 text-slate-700 dark:text-slate-200
                             hover:bg-amber-100/70 dark:hover:bg-amber-900/40
                             transition-colors cursor-pointer"
                    >
                      <span class="truncate">{formatAction(s)}</span>
                      <span class="font-mono text-xs font-semibold text-emerald-700 dark:text-emerald-400 shrink-0">
                        +{s.delta}
                      </span>
                    </button>
                  </li>
                {/each}
              </ul>
            </div>
          {/if}

          {#if segment.items.length > 0}
            <details class="group">
              <summary
                class="flex items-center justify-between cursor-pointer list-none
                       [&::-webkit-details-marker]:hidden
                       px-5 sm:px-6 py-3 text-sm font-medium
                       text-slate-500 dark:text-slate-400
                       hover:text-slate-800 dark:hover:text-slate-200
                       hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors
                       group-open:border-b group-open:border-slate-100 dark:group-open:border-slate-800"
              >
                <span>Ver detalhes dos passos</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  class="w-4 h-4 transition-transform group-open:rotate-180"
                  aria-hidden="true"
                >
                  <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.06l3.71-3.83a.75.75 0 1 1 1.08 1.04l-4.25 4.39a.75.75 0 0 1-1.08 0L5.21 8.27a.75.75 0 0 1 .02-1.06Z" clip-rule="evenodd" />
                </svg>
              </summary>
              <ul class="px-5 sm:px-6 py-4 divide-y divide-slate-100 dark:divide-slate-800">
                {#each segment.items as item (item.id)}
                  <li class="py-2 flex items-start justify-between gap-3 text-sm">
                    <div class="min-w-0">
                      <div class="text-slate-700 dark:text-slate-200">{item.label}</div>
                      <div class="text-xs text-slate-400 dark:text-slate-500 leading-snug">
                        {item.rule}
                      </div>
                    </div>
                    <span
                      class="font-mono font-semibold tabular-nums shrink-0
                             {item.contribution > 0
                               ? 'text-slate-900 dark:text-slate-100'
                               : 'text-slate-300 dark:text-slate-600'}"
                    >
                      {item.contribution}
                    </span>
                  </li>
                {/each}
              </ul>
            </details>
          {/if}

          <!-- Benefits -->
          <div class="border-t border-slate-100 dark:border-slate-800
                      px-5 sm:px-6 py-4 bg-slate-50/40 dark:bg-slate-950/40 rounded-b-lg">
            {#if segment.groups.length === 0}
              <p class="text-sm text-slate-400 dark:text-slate-500 italic">
                Benefícios ainda não cadastrados para este segmento.
              </p>
            {:else}
              {#each segment.groups as group (group.category)}
                <section class="mb-5 last:mb-0">
                  <h4 class="flex items-center gap-2 text-[10px] font-semibold
                             text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    <span class="w-2 h-2 rounded-full {group.meta.accent}"></span>
                    {group.meta.label}
                  </h4>

                  {#if group.meta.layout === 'grid'}
                    <div class="grid grid-cols-2 gap-2">
                      {#each group.items as b (b.family)}
                        {@render BenefitCard(b, justLeveledUp[segment.id], segment.level)}
                      {/each}
                    </div>
                  {:else}
                    <ul class="space-y-1.5">
                      {#each group.items as b (b.family)}
                        {@render BenefitRow(b, justLeveledUp[segment.id], segment.level)}
                      {/each}
                    </ul>
                  {/if}
                </section>
              {/each}
            {/if}
          </div>
        </article>
      {/each}
    </div>
  </section>

  <footer class="mt-12 pt-6 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-500">
    <ProgramInfo />

    <div class="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
      <p class="mb-2">
        Informações baseadas nas páginas oficiais do Itaú. O PDF com os detalhes
        completos está disponível no final de cada página.
      </p>
      <ul class="flex flex-col sm:flex-row gap-x-6 gap-y-1">
        <li>
          <a
            href="https://www.itau.com.br/uniclass/minhas-vantagens"
            target="_blank"
            rel="noopener noreferrer"
            class="hover:text-slate-600 dark:hover:text-slate-300 underline underline-offset-2"
          >
            Uniclass — Minhas Vantagens ↗
          </a>
        </li>
        <li>
          <a
            href="https://www.itau.com.br/personnalite/minhas-vantagens"
            target="_blank"
            rel="noopener noreferrer"
            class="hover:text-slate-600 dark:hover:text-slate-300 underline underline-offset-2"
          >
            Personnalité — Minhas Vantagens ↗
          </a>
        </li>
      </ul>
    </div>
  </footer>
</main>

<!-- ────────── Snippets ────────── -->

{#snippet BenefitRow(b: Benefit, isLevelingUp: boolean, currentLevel: Level)}
  <li
    class="flex items-start gap-2 text-sm rounded px-1 -mx-1
           {isLevelingUp && b.minLevel === currentLevel ? 'levelup-fade' : ''}"
  >
    <span class="text-slate-300 dark:text-slate-600 mt-0.5">•</span>
    <span
      class={b.highlight
        ? 'font-semibold text-slate-900 dark:text-slate-100'
        : 'text-slate-700 dark:text-slate-200'}
    >
      {b.label}
    </span>
  </li>
{/snippet}

{#snippet BenefitCard(b: Benefit, isLevelingUp: boolean, currentLevel: Level)}
  {@const slugs = brandSlugs(b)}
  <article
    class="bg-white dark:bg-slate-800/60 rounded-lg border
           border-slate-200 dark:border-slate-700 p-3 flex gap-2.5
           {b.options ? 'col-span-full' : ''}
           {isLevelingUp && b.minLevel === currentLevel ? 'levelup-fade' : ''}"
  >
    <div class="relative w-10 h-10 rounded-md bg-slate-100 dark:bg-slate-700
                flex items-center justify-center shrink-0 overflow-hidden">
      <span class="text-slate-500 dark:text-slate-300 font-bold text-xs">
        {(b.brand ?? b.label)[0]?.toUpperCase()}
      </span>
      {#if slugs[0] && logoUrl(slugs[0])}
        <img
          src={logoUrl(slugs[0])}
          alt=""
          loading="lazy"
          class="absolute inset-0 w-full h-full object-contain p-1.5"
        />
      {/if}
    </div>

    <div class="flex-1 min-w-0">
      <p class="text-xs text-slate-700 dark:text-slate-200 leading-snug
                {b.highlight ? 'font-semibold' : ''}">
        {b.label}
      </p>

      {#if b.options}
        <details class="mt-2 group/opt">
          <summary
            class="text-xs text-slate-500 dark:text-slate-400 cursor-pointer list-none
                   [&::-webkit-details-marker]:hidden inline-flex items-center gap-1
                   hover:text-slate-800 dark:hover:text-slate-200"
          >
            <span>Ver opções ({b.options.length})</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                 class="w-3 h-3 transition-transform group-open/opt:rotate-180" aria-hidden="true">
              <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.06l3.71-3.83a.75.75 0 1 1 1.08 1.04l-4.25 4.39a.75.75 0 0 1-1.08 0L5.21 8.27a.75.75 0 0 1 .02-1.06Z" clip-rule="evenodd" />
            </svg>
          </summary>
          <ul class="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-300">
            {#each b.options as opt}
              <li class="flex gap-1.5">
                <span class="text-slate-300 dark:text-slate-600">•</span>
                <span>{opt}</span>
              </li>
            {/each}
          </ul>
        </details>
      {/if}
    </div>
  </article>
{/snippet}