import { Schema } from "@markdoc/markdoc";
import { Url } from "../schemas/Url";

export const embed: Schema = {
  render: 'Embed',
  attributes: {
    url: {
      type: Url,
      required: true,
    },
  }
};
