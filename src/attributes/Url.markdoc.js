export class Url {
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

  transform(value, config) {
    return new URL(value);
  }
}
