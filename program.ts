#!/usr/bin/env -S npx tsx

import { program } from 'commander';
import { defaultConfig, resolveClosingTag, resolveSelfEnclosingTag, extractTitleToFrontmatter } from 'gbmd-mdoc';

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { globSync } from 'glob';
import Markdoc, { Config } from '@markdoc/markdoc';


export function convertFile(filePath: string, config: Config = {}) {
    config = { ...defaultConfig, ...config }
    let file = readFileSync(filePath, { encoding: 'utf8', flag: 'r' }).split('\n');

    let ast = Markdoc.parse(file.join('\n'));
    let errors = Markdoc.validate(ast, config);
    if (errors.length !== 0) {
      // Resolve end* to /* first
      resolveClosingTag(errors, file);
    }

    ast = Markdoc.parse(file.join('\n'));
    errors = Markdoc.validate(ast, config);
    if (errors.length !== 0) {
      // Resolve self-enclosing tags
      resolveSelfEnclosingTag(errors, file);
    }

    ast = Markdoc.parse(file.join('\n'));
    errors = Markdoc.validate(ast, config);

    file = extractTitleToFrontmatter(ast).split('\n');

    return { file, errors }
}

async function gbmd_mdoc(options: { input: string; output: string }, config: Config = defaultConfig) {

  const inputPath = options.input;
  if (!inputPath) throw new Error('Input Path is empty')

  const outputPath = options.output;
  if (!outputPath) throw new Error('Output Path is empty')

  let data = "";
  if (!process.stdin.isTTY) {
    for await (const chunk of process.stdin) data += chunk
  }

  const filePaths = [...globSync(`${inputPath}/**/*.md`), ...data.split('\n') ];

  for (const filePath of filePaths) {
    if (!filePath){
      continue;
    }

    let {file, errors} = convertFile(filePath, config);

    if (errors.length !== 0) {
      process.stderr.write(filePath)
      process.stderr.write(file.join('\n'))
      process.stderr.write(JSON.stringify(errors, undefined, 2))
    }
    else {
      const dataOutput = new Uint8Array(Buffer.from(file.join('\n')))
      mkdirSync(`${outputPath}/${dirname(filePath.replace(inputPath, ''))}`, {recursive: true});
      writeFileSync(`${outputPath}/${filePath.replace(inputPath, '').replace(/\.md$/, '.mdoc')}`, dataOutput)
    }
  }
}

program
  .name('gbmd-mdoc')
  .description('Converts Gitbook md to Markdoc mdoc')
  .version('0.1.0')
  .requiredOption('-o, --output <dir>', 'output directory')
  .requiredOption('-i, --input <dir>', 'input directory')
  .action(gbmd_mdoc)

program.parse()

