import { Schema } from "@markdoc/markdoc";

export const contentref: Schema = {
  render: 'ContentRef',
  children: ['link', 'paragraph', 'tag'],
  attributes: {
    url: {
      type: String,
      required: true,
    },
  }
};
