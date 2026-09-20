<script lang="ts">
  let {
    value = $bindable(0),
    placeholder = '0'
  }: { value?: number; placeholder?: string } = $props()

  let focused = $state(false)
  let text = $state(value ? value.toLocaleString('pt-BR') : '')

  // Sync the visible text when value changes externally (URL, suggestion, reset).
  $effect(() => {
    if (!focused) {
      text = value ? value.toLocaleString('pt-BR') : ''
    }
  })

  function onInput(e: Event) {
    const el = e.currentTarget as HTMLInputElement
    const digits = el.value.replace(/\D/g, '')
    el.value = digits
    text = digits
    value = digits ? Number(digits) : 0
  }

  function onFocus(e: FocusEvent) {
    const el = e.currentTarget as HTMLInputElement
    focused = true
    const raw = value ? String(value) : ''
    text = raw
    el.value = raw
    requestAnimationFrame(() => el.select())
  }

  function onBlur() {
    focused = false
    text = value ? value.toLocaleString('pt-BR') : ''
  }
</script>

<div
  class="flex items-center gap-1 px-2 py-1 rounded border
         border-slate-300 bg-white
         dark:border-slate-700 dark:bg-slate-950
         focus-within:ring-2 focus-within:ring-blue-400 dark:focus-within:ring-blue-500
         transition-colors"
>
  <span class="text-slate-500 dark:text-slate-400 text-sm select-none">R$</span>
  <input
    type="text"
    inputmode="numeric"
    value={text}
    {placeholder}
    oninput={onInput}
    onfocus={onFocus}
    onblur={onBlur}
    class="w-28 bg-transparent text-right text-slate-800 dark:text-slate-100
           tabular-nums focus:outline-none
           placeholder:text-slate-400 dark:placeholder:text-slate-600"
  />
</div>