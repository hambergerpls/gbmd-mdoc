/**
 * @type {import('@markdoc/markdoc').Schema}
 */
export const hint = {
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
