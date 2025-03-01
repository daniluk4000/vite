import type { } from '@nuxt/types'
import { resolve } from 'upath'
import { lt } from 'semver'
import { name, version } from '../package.json'
import type { ViteOptions } from './types'

function nuxtVite () {
  const { nuxt } = this

  if (!nuxt.options.dev) {
    return
  }

  // Check nuxt version
  const minVersion = '2.15.2'
  const currentVersion = nuxt.constructor.version || '0.0.0'
  if (lt(nuxt.constructor.version, minVersion)) {
    // eslint-disable-next-line no-console
    console.warn(`disabling nuxt-vite since nuxt >= ${minVersion} is required (curret version: ${currentVersion})`)
    return
  }

  nuxt.options.cli.badgeMessages.push(`⚡  Vite Mode Enabled (v${version})`)
  // eslint-disable-next-line no-console
  console.log(
    '🧪  Vite mode is experimental and many nuxt modules are still incompatible\n',
    '   If found a bug, please report via https://github.com/nuxt/vite/issues with a minimal reproduction'
  )

  // Disable loading-screen because why have it!
  nuxt.options.build.loadingScreen = false
  nuxt.options.build.indicator = false
  nuxt.options._modules = nuxt.options._modules
    .filter(m => !(Array.isArray(m) && m[0] === '@nuxt/loading-screen'))

  if (nuxt.options.store) {
    this.addTemplate({
      src: resolve(__dirname, './runtime/templates', 'store.js'),
      fileName: 'store.js'
    })
  }
  this.addTemplate({
    src: resolve(__dirname, './runtime/templates', 'middleware.js'),
    fileName: 'middleware.js'
  })

  nuxt.hook('builder:prepared', async (builder) => {
    builder.bundleBuilder.close()
    delete builder.bundleBuilder
    const { ViteBuilder } = await import('./vite')
    builder.bundleBuilder = new ViteBuilder(builder)
  })
}

nuxtVite.meta = { name, version }
export default nuxtVite

declare module '@nuxt/types/config/index' {
  interface NuxtOptions {
    /**
     * Configuration for Vite.
     * Severe the same functionality as Vite's `vite.config.ts`.
     * It will merges with Nuxt specify configurations and plugins.
     *
     * @link https://vitejs.dev/config/
     */
    vite?: ViteOptions
  }
}
