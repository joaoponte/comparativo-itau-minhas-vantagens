import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // Set the base path to your repository name for GitHub Pages
  base: '/comparativo-itau-minhas-vantagens/',
  plugins: [svelte(), tailwindcss()]
})