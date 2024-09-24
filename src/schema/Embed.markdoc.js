import { Url } from '../attributes/index.js'

/** @type {import('@markdoc/markdoc').Schema} */
export const embed = {
  render: 'Embed',
  attributes: {
    url: {
      type: Url,
      required: true,
    },
  }
};
