import { Schema } from "@markdoc/markdoc";

export const tab: Schema = {
  render: 'Tab',
  attributes: {
    title: {
      type: String,
      required: true,
    },
  }
};
