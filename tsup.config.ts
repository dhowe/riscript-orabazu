import type { Options } from 'tsup';
import { defineConfig } from 'tsup';
import { esbuildPluginVersionInjector } from 'esbuild-plugin-version-injector';


// const env = process.env.NODE_ENV;

const opts: Options = {
  name: "riscript",
  entry: { riscript: 'src/index.js' },
  outDir: 'dist',
  watch: false,
  clean: true,
  minify: false,
  sourcemap: true,
  dts: false,
  bundle: true,
  esbuildPlugins: [esbuildPluginVersionInjector()]
}

const esm: Options = {
  format: ['esm'],
  ...opts,
  target: 'es2020',
  splitting: true,
  skipNodeModulesBundle: true, // ?
  outExtension({ format }) {
    return {
      js: `.js`,
    }
  },
}

const cjs: Options = {
  format: ['cjs'],
  ...opts,
  target: 'es2020', // ?
  noExternal: ['chevrotain'], // ?
  // skipNodeModulesBundle: true, // ?
  platform: "node",
  outExtension({ format }) {
    return {
      js: `.cjs`,
    }
  },
}

const iife: Options = {
  format: ['iife'],
  ...opts,
  target: 'es2020', // ?
  platform: "browser",
  globalName: "RiScript",
}

export default defineConfig([cjs,esm]);
