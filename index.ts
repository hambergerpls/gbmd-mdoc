import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import Markdoc, { Config, type Node, type ValidateError } from '@markdoc/markdoc';
import { globSync } from 'glob';
import { config as defaultConfig } from './src/markdoc.config';
import yaml from 'js-yaml';
import { type GitBookFrontmatter } from './src/types';
import tags from './src/tags';
import schemas from './src/schemas';


export function resolveClosingTag(errors: ValidateError[], file: string[]) {
  for (const error of errors) {
    if (error.type === 'tag' && error.error.id === 'missing-closing') {
      const match = [ ...error.error.message.matchAll(/'(end.*)'/g) ]
      if (match.length === 0) {
        continue;
      }
      const [[_, tag]] = match;
      if (error.location) file[error.location?.start.line] = file[error.location?.start.line].replace(`${tag}`, `${tag.replace('end', '/')}`)
    }
  }
}

export function resolveSelfEnclosingTag(errors: ValidateError[], file: string[], selfEnclosingTags: string[] = []) {
  selfEnclosingTags = [ 'embed', ...selfEnclosingTags ]
  for (const error of errors) {
    if (error.type === 'tag' && error.error.id === 'missing-closing') {

      const match = [ ...error.error.message.matchAll(/'(.*)'/g) ]
      if (match.length === 0) {
        continue;
      }
      const [[_, tag]] = match;
      if (selfEnclosingTags.includes(tag)) {
        if (error.location) file[error.location?.start.line] = file[error.location?.start.line].replace(" %}", " /%}")
      }
    }
  }
}

export function extractTitleToFrontmatter(ast: Node) {
  for (const node of ast.walk()) {
    if ( node.type === 'heading' && node.attributes.level === 1 ) {
       const frontmatter = ( ast.attributes.frontmatter ? yaml.load(ast.attributes.frontmatter) : {} ) as GitBookFrontmatter;
       frontmatter.title = node.children.find(e => e.type === 'inline')?.children.find(e => e.type === 'text')?.attributes.content;
       ast.attributes.frontmatter = yaml.dump(frontmatter);
       return Markdoc.format(ast);
    }
  }
  return Markdoc.format(ast);
}

export function appendToFrontmatter(ast: Node, data: { [key: string]: any }) {
  const frontmatter = ( ast.attributes.frontmatter ? yaml.load(ast.attributes.frontmatter) : {} ) as GitBookFrontmatter;
  ast.attributes.frontmatter = yaml.dump({ ...frontmatter, ...data});
  return Markdoc.format(ast);
}

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

export async function gbmd_mdoc(options: { input: string; output: string }, config: Config = defaultConfig) {

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

export {
  tags,
  schemas,
  defaultConfig,
}

export default class GBMD_MDOC {
  static tags = tags;
  static schemas = schemas;
  static resolveClosingTag = resolveClosingTag;
  static resolveSelfEnclosingTag = resolveSelfEnclosingTag;
  static extractTitleToFrontmatter = extractTitleToFrontmatter;
  static appendToFrontmatter = appendToFrontmatter;
  static convertFile = convertFile;
  static gbmd_mdoc = gbmd_mdoc;

  selfEnclosingTags;
  config;
  constructor({ config, selfEnclosingTags }:{ config: Config, selfEnclosingTags: string[] }) {
    this.config = config;
    this.selfEnclosingTags = selfEnclosingTags;
  }

  convertFile = (filePath: Parameters<typeof convertFile>[0]) => convertFile(filePath, this.config)
  resolveSelfEnclosingTag = (errors: Parameters<typeof resolveSelfEnclosingTag>[0], file: Parameters<typeof resolveSelfEnclosingTag>[1]) => resolveSelfEnclosingTag(errors, file, this.selfEnclosingTags);
}
