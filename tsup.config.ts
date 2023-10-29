import type { Options } from 'tsup';

const env = process.env.NODE_ENV;

export const tsup: Options = {
  splitting: false,
  sourcemap: env === 'prod', // source map is only available in prod
  clean: true, // rimraf dist
  dts: false, // generate dts file for main module
  format: ['cjs', 'esm'], // generate cjs and esm files
  minify: env === 'production',
  bundle: env === 'production',
  skipNodeModulesBundle: true,
  entryPoints: ['src/index.js'],
  watch: false,//seenv === 'development',
  target: 'es2020',
  outDir: env === 'production' ? 'dist' : 'lib',
  entry: ['src/**/*.js'],
};
