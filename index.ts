import Markdoc, { Config, type Node, type ValidateError } from '@markdoc/markdoc';
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



export {
  tags,
  schemas,
  defaultConfig,
}

export default class GBMD_MDOC {
  static tags = tags;
  static schemas = schemas;
  static defaultConfig = defaultConfig;
  static resolveClosingTag = resolveClosingTag;
  static resolveSelfEnclosingTag = resolveSelfEnclosingTag;
  static extractTitleToFrontmatter = extractTitleToFrontmatter;
  static appendToFrontmatter = appendToFrontmatter;

  selfEnclosingTags;
  config;
  constructor({ config, selfEnclosingTags }:{ config: Config, selfEnclosingTags: string[] }) {
    this.config = config;
    this.selfEnclosingTags = selfEnclosingTags;
  }

  resolveSelfEnclosingTag = (errors: Parameters<typeof resolveSelfEnclosingTag>[0], file: Parameters<typeof resolveSelfEnclosingTag>[1]) => resolveSelfEnclosingTag(errors, file, this.selfEnclosingTags);
}
