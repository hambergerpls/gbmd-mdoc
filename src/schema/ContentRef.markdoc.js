
/** @type {import('@markdoc/markdoc').Schema} */
export const contentref = {
  render: 'ContentRef',
  children: ['link', 'paragraph', 'tag'],
  attributes: {
    url: {
      type: String,
      required: true,
    },
  }
};
