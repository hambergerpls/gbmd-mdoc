#! /usr/bin/env node

import { program } from 'commander';
import { gbmd_mdoc } from './src/index.js';

program
  .name('gbmd-mdoc')
  .description('Converts Gitbook md to Markdoc mdoc')
  .version('0.0.3')
  .requiredOption('-o, --output <dir>', 'output directory')
  .requiredOption('-i, --input <dir>', 'input directory')
  .action(gbmd_mdoc)

program.parse()
