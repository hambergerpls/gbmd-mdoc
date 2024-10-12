#!/usr/bin/env node
const { buildSync } = require('esbuild');

const shared = {
  bundle: true,
  entryPoints: ['index.ts'],
  outdir: 'dist',
  sourcemap: 'external',
  external: [],
  format: 'esm',
};
buildSync({ ...shared, format: 'cjs' });
buildSync({ ...shared, outExtension: { '.js': '.mjs' } });

const program = {
  ...shared,
  entryPoints: ['program.ts'],
  platform: 'node',
}
buildSync({ ...program, format: 'cjs' });

