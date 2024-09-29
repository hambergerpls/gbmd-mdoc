/**
 * @typedef {import('@markdoc/markdoc').ValidationError} ValidationError
 * @typedef {import('@markdoc/markdoc').Config} Config
 */

export class Url {
  /**
  *  @param {unknown} value 
  *  @param {Config} config 
  *  @returns {ValidationError[]}
  */
  validate(value, config) {
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

  /**
  * @param {string} value 
  * @param {Config} config 
  */
  transform(value, config) {
    return value;
  }
}
