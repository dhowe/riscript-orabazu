import type { Options } from 'tsup';

const env = process.env.NODE_ENV;

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
  target: 'es2020',
  format: [ 'esm'],
  skipNodeModulesBundle: true,
}

const cjsOpts: Options = {
  target: 'es2020',
  noExternal: ['chevrotain'],
  format: ['cjs'],
  skipNodeModulesBundle: false,
  platform: "node",
}

export const tsup: Options = { ...opts, ...cjsOpts }



/*
  bundle: true,
  platform: "node",
*/