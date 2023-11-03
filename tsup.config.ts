import type { Options } from 'tsup';
import { defineConfig } from 'tsup';


// const env = process.env.NODE_ENV;

const opts: Options = {
  name: "riscript",
  entry: { riscript: 'src/index.js' },
  outDir: 'dist',
  watch: false,
  clean: true,
  minify: true,
  sourcemap: true,
  dts: false,
  bundle: true,
  splitting: true,
}

const esmOpts: Options = {
  format: ['esm'],
  ...opts,
  target: 'es2020',
  skipNodeModulesBundle: true, // ?
}

const cjsOpts: Options = {
  format: ['cjs'],
  ...opts,
  target: 'es2020', // ?
  noExternal: ['chevrotain'], // ?
  skipNodeModulesBundle: false, // ?
  platform: "node"
}

export default defineConfig([esmOpts, cjsOpts]);
