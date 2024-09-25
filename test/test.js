import { readFileSync } from "node:fs";
import { it } from "mocha";
import { describe } from "mocha";
import assert from "assert";
import Markdoc from '@markdoc/markdoc';
import { config } from '../src/markdoc.config.js';
import { convertFile, resolveClosingTag, resolveSelfEnclosingTag } from "../src/index.js";
import { globSync } from 'glob';

describe('Closing tags', () => {
   it('should convert end* tags to /* tags', () => {
    
    const file = readFileSync('./test/samples/closingtags.md', { encoding: 'utf8', flag: 'r' }).split('\n');

    let ast = Markdoc.parse(file.join('\n'));
    let errors = Markdoc.validate(ast, config);
    assert.notEqual(errors.length, 0);
    resolveClosingTag(errors, file);
    ast = Markdoc.parse(file.join('\n'));
    errors = Markdoc.validate(ast, config);
    assert.deepEqual(errors, []);
  });

   it('should convert end* tags to /* tags in nested tags', () => {
    
    const file = readFileSync('./test/samples/closingtags-with-nested-tags.md', { encoding: 'utf8', flag: 'r' }).split('\n');

    let ast = Markdoc.parse(file.join('\n'));
    let errors = Markdoc.validate(ast, config);
    assert.notEqual(errors.length, 0);
    resolveClosingTag(errors, file);
    ast = Markdoc.parse(file.join('\n'));
    errors = Markdoc.validate(ast, config);
    assert.deepEqual(errors, []);
  });

   it('should convert selfEnclosing tags to /%}', () => {
    
    const file = readFileSync('./test/samples/selfenclosingtags.md', { encoding: 'utf8', flag: 'r' }).split('\n');

    let ast = Markdoc.parse(file.join('\n'));
    let errors = Markdoc.validate(ast, config);
    assert.notEqual(errors.length, 0);
    resolveSelfEnclosingTag(errors, file);
    ast = Markdoc.parse(file.join('\n'));
    errors = Markdoc.validate(ast, config);
    assert.deepEqual(errors, []);
  });
});

describe('Converting Gitbook templates', () => {
   it('Should convert Gitbook Design System template', () => {
      const filePaths = [...globSync(`./test/samples/design-system/**/*.md`)];
      for (const filePath of filePaths) {
        const { errors } = convertFile(filePath);
        assert.deepEqual(errors, []);
      }
   })
   it('Should convert Gitbook Product Docs template', () => {
      const filePaths = [...globSync(`./test/samples/product-docs/**/*.md`)];
      for (const filePath of filePaths) {
        const { errors } = convertFile(filePath);
        assert.deepEqual(errors, []);
      }
   })
});
