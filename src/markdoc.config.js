import { hint, embed, contentref, tab, tabs } from './schema/index.js';

const tags = {
  hint,
  embed,
  tab,
  tabs,
}

tags['content-ref'] = contentref

/** @type {import('@markdoc/markdoc').Config} */
export const config = {
  tags: tags
};

