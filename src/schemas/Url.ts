import type { Config, CustomAttributeTypeInterface, Scalar, ValidationError } from "@markdoc/markdoc";

export class Url implements CustomAttributeTypeInterface {
  validate(value: string, config: Config): ValidationError[] {
    if (typeof value !== 'string' || !URL.canParse(value))
      return [
        {
          id: 'invalid-url-type',
          level: 'critical',
          message: 'Must be a string with a valid url path',
        }
      ];

    return [];
  }

  transform(value, config): Scalar {
    return value;
  }
}
