#!/usr/bin/env node
import { buildSync } from 'esbuild';

const shared = {
  bundle: true,
  entryPoints: ['index.ts'],
  outdir: 'dist',
  sourcemap: 'external',
  external: [],
  format: 'esm',
  platform: 'node',
};
buildSync(shared);
