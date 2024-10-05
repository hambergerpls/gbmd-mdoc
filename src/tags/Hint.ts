import { Schema } from "@markdoc/markdoc";

export const hint: Schema = {
  render: 'Hint',
  children: ['paragraph', 'tag', 'list'],
  attributes: {
    style: {
      type: String,
      default: 'info',
      matches: ['info', 'warning', 'danger', 'success'],
      errorLevel: 'critical'
    },
  }
};
