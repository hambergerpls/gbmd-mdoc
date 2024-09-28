import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import Markdoc from '@markdoc/markdoc';
import { globSync } from 'glob';
import { config } from './markdoc.config.js';
import yaml from 'js-yaml';

export const selfEnclosingTags = [
  'embed',
]; 

export function resolveClosingTag(errors, file){
  for (const error of errors) {
    if (error.type === 'tag' && error.error.id === 'missing-closing') {
      const match = [ ...error.error.message.matchAll(/'(end.*)'/g) ]
      if (match.length === 0) {
        continue;
      }
      const [[_, tag]] = match;
      file[error.location.start.line] = file[error.location.start.line].replace(`${tag}`, `${tag.replace('end', '/')}`)
    }
  }
}

export function resolveSelfEnclosingTag(errors, file){
  for (const error of errors) {
    if (error.type === 'tag' && error.error.id === 'missing-closing') {

      const match = [ ...error.error.message.matchAll(/'(.*)'/g) ]
      if (match.length === 0) {
        continue;
      }
      const [[_, tag]] = match;
      if (selfEnclosingTags.includes(tag)) {
        file[error.location.start.line] = file[error.location.start.line].replace(" %}", " /%}")
      }
    }
  }
}

/**
 * @param {import('@markdoc/markdoc').Node} ast 
 */
export function extractTitleToFrontmatter(ast){
  for (const node of ast.walk()) {
    if ( node.type === 'heading' && node.attributes.level === 1 ) {
       const frontmatter = ast.attributes.frontmatter ? yaml.load(ast.attributes.frontmatter) : {};
       frontmatter.title = node.children.find(e => e.type === 'inline').children.find(e => e.type === 'text').attributes.content;
       ast.attributes.frontmatter = yaml.dump(frontmatter);
       return Markdoc.format(ast);
    }
  }
  return Markdoc.format(ast);
}

export function convertFile(filePath){
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

export async function gbmd_mdoc(options) {

  const inputPath = options.input;

  const outputPath = options.output;

  let data = "";
  if (!process.stdin.isTTY) {
    for await (const chunk of process.stdin) data += chunk
  }

  const filePaths = [...globSync(`${inputPath}/**/*.md`), ...data.split('\n') ];

  for (const filePath of filePaths) {
    if (!filePath){
      continue;
    }

    let {file, errors} = convertFile(filePath);

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
