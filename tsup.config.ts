import type { Options } from 'tsup';

const env = process.env.NODE_ENV;

export const tsup: Options = {
  name: "riscript",
  target: 'es2020',
  entry: ['src/riscript.js'],
  format: ['cjs', 'esm'], // generate cjs and esm files
  splitting: true,
  sourcemap: env === 'prod', // source map is only available in prod
  clean: true, // rimraf dist
  dts: false, // generate dts file for main module
  minify: env === 'prod',
  bundle: env === 'prod',
  skipNodeModulesBundle: true,
  watch: false,//env === 'development',
  outDir: env === 'prod' ? 'dist' : 'lib',

};
