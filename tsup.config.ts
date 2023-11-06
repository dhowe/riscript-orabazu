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
  cjsInterop: true,
  splitting: true,
  outExtension({ format }) {
    return {
      js: `.cjs`,
    }
  },
}

const testCjs: Options = {
  format: ['cjs'],
  target: 'es2020', // ?
  platform: "node",
  outExtension({ format }) {
    return {
      js: `.cjs`,
    }
  },
  name: "riscript_tests",
  entry: ['test/riscript*.js' ],
  outDir: 'test/dist',
  watch: false,
  clean: false,
  minify: false,
  sourcemap: false,
  dts: false,
  bundle: false,
}


const testEsm: Options = {
  format: ['esm'],
  target: 'es2020', // ?
  platform: "node",
  outExtension({ format }) {
    return {
      js: `.js`,
    }
  },
  name: "riscript_tests",
  entry: ['test/riscript*.js' ],
  outDir: 'test/dist',
  watch: false,
  clean: false,
  minify: false,
  sourcemap: false,
  dts: false,
  bundle: false,
}

const iife: Options = {
  format: ['iife'],
  ...opts,
  target: 'es2020', // ?
  platform: "browser",
  globalName: "_global",
  outExtension({ format }) {
    return {
      js: `.iife.js`,
    }
  },
  footer: { js: "RiScript = _global.default" }
}

export default defineConfig([esm,cjs,iife,testEsm]);
