import { readFileSync } from "node:fs";
import { it } from "mocha";
import { describe } from "mocha";
import assert from "assert";
import Markdoc from '@markdoc/markdoc';
import { extractTitleToFrontmatter, appendToFrontmatter, resolveClosingTag, resolveSelfEnclosingTag, defaultConfig } from "../";
import { convertFile } from "../program";
import { globSync } from 'glob';

describe('Closing tags', () => {
  it('should convert end* tags to /* tags', () => {

    let file = readFileSync('./test/samples/closingtags.md', { encoding: 'utf8', flag: 'r' });

    let ast = Markdoc.parse(file);
    let errors = Markdoc.validate(ast, defaultConfig);
    assert.notEqual(errors.length, 0);
    ( { result: file, errors } = resolveClosingTag(file) );
    assert.deepEqual(errors, []);
  });

  it('should convert end* tags to /* tags in nested tags', () => {

    let file = readFileSync('./test/samples/closingtags-with-nested-tags.md', { encoding: 'utf8', flag: 'r' });

    let ast = Markdoc.parse(file);
    let errors = Markdoc.validate(ast, defaultConfig);
    assert.notEqual(errors.length, 0);
    ( { result: file, errors } = resolveClosingTag(file) );
    assert.deepEqual(errors, []);
  });

  it('should convert selfEnclosing tags to /%}', () => {

    let file = readFileSync('./test/samples/selfenclosingtags.md', { encoding: 'utf8', flag: 'r' });

    let ast = Markdoc.parse(file);
    let errors = Markdoc.validate(ast, defaultConfig);
    assert.notEqual(errors.length, 0);
    ( { result: file, errors } = resolveSelfEnclosingTag(file) );
    assert.deepEqual(errors, []);
  });
});

describe('Frontmatter', () => {
   it('Should add first level 1 heading as title to frontmatter', () => {
    let file = readFileSync('./test/samples/title-to-frontmatter.md', { encoding: 'utf8', flag: 'r' });

    let ast = Markdoc.parse(file);
    ( { result: file } = extractTitleToFrontmatter(file) );
    ast = Markdoc.parse(file);
    assert.equal(ast.attributes.frontmatter,'title: This is my page title')
   })

   it('Should add given data to frontmatter', () => {
    let file = readFileSync('./test/samples/data-to-frontmatter.md', { encoding: 'utf8', flag: 'r' });

    let ast = Markdoc.parse(file);
    const data = { 
         data1: 'this is data 1', 
         data2: 42069, 
         data3: ['item 1', 'item 2', 'item 3'], 
         data4: { 
            field1: 'this is value1',
            field2: 69420,
            field3: ['item 1', 'item 2', 'item 3'],
            field4: {
              subfield1: 'this is subvalue1',
              subfield2: 6969,
              subfield3: ['item 1', 'item 2', 'item 3']
            }
         } 
      };
    ( { result: file } = appendToFrontmatter(file, data) );
    ast = Markdoc.parse(file);
   const expected = `data1: this is data 1
data2: 42069
data3:
  - item 1
  - item 2
  - item 3
data4:
  field1: this is value1
  field2: 69420
  field3:
    - item 1
    - item 2
    - item 3
  field4:
    subfield1: this is subvalue1
    subfield2: 6969
    subfield3:
      - item 1
      - item 2
      - item 3`;
    assert.equal(ast.attributes.frontmatter, expected)
   })

   it('Should not overwrite existing data given data to frontmatter', () => {
    let file = readFileSync('./test/samples/existing-data-to-frontmatter.md', { encoding: 'utf8', flag: 'r' });

    let ast = Markdoc.parse(file);
    const data = { 
         data1: 'this is data 1', 
         data2: 42069, 
         data3: ['item 1', 'item 2', 'item 3'], 
         data4: { 
            field1: 'this is value1',
            field2: 69420,
            field3: ['item 1', 'item 2', 'item 3'],
            field4: {
              subfield1: 'this is subvalue1',
              subfield2: 6969,
              subfield3: ['item 1', 'item 2', 'item 3']
            }
         } 
      };
     ( { result: file } = appendToFrontmatter(file, data) );
    ast = Markdoc.parse(file);
   const expected = `title: This is my page title
data1: this is data 1
data2: 42069
data3:
  - item 1
  - item 2
  - item 3
data4:
  field1: this is value1
  field2: 69420
  field3:
    - item 1
    - item 2
    - item 3
  field4:
    subfield1: this is subvalue1
    subfield2: 6969
    subfield3:
      - item 1
      - item 2
      - item 3`;
    assert.equal(ast.attributes.frontmatter, expected)
   })

  it('Should override existing fields given data if fields match to frontmatter', () => {
    let file = readFileSync('./test/samples/override-existing-fields-to-frontmatter.md', { encoding: 'utf8', flag: 'r' });

    let ast = Markdoc.parse(file);
    const data = { 
      title: 'This is my new title',
      description: 'This is my new description'
    };
    ( { result: file } = appendToFrontmatter(file, data) );
    ast = Markdoc.parse(file);
    const expected = `title: This is my new title
description: This is my new description`;
    assert.equal(ast.attributes.frontmatter, expected)
  })
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
