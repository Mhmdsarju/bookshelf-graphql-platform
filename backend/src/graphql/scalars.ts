import { GraphQLScalarType, Kind } from 'graphql';

export const DateTimeScalar = new GraphQLScalarType({
  name: 'DateTime',
  description: 'ISO-8601 date-time string',
  serialize(value) {
    const date = value instanceof Date ? value : new Date(String(value));
    if (Number.isNaN(date.getTime()))
      throw new TypeError('DateTime cannot represent an invalid date');
    return date.toISOString();
  },
  parseValue(value) {
    if (typeof value !== 'string' || Number.isNaN(Date.parse(value))) {
      throw new TypeError('DateTime must be a valid ISO-8601 string');
    }
    return new Date(value);
  },
  parseLiteral(ast) {
    if (ast.kind !== Kind.STRING || Number.isNaN(Date.parse(ast.value))) {
      throw new TypeError('DateTime must be a valid ISO-8601 string');
    }
    return new Date(ast.value);
  },
});
