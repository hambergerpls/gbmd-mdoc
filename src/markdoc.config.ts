import type { Config } from '@markdoc/markdoc';
import tag from './tags';

const tags = {
  hint: tag.hint,
  embed: tag.embed,
  tab: tag.tab,
  tabs: tag.tabs,
}

tags['content-ref'] = tag.contentref

export const config: Config = {
  tags: tags
};

