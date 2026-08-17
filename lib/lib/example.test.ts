import { OpenAPIObject, ReferenceObject, SchemaObject } from 'openapi3-ts/oas31';
import { describe, expect, it } from 'vitest';
import { GenerateExampleStringForSchema } from './example';
import { Language } from './language';

const spec = {
  openapi: '3.1.0',
  info: { title: 'test', version: '1' },
  components: {
    schemas: {
      Node: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          child: { $ref: '#/components/schemas/Node' },
        },
      },
      Pet: {
        type: 'object',
        properties: {
          id: { type: 'integer', minimum: 3 },
          name: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          status: { type: 'string', enum: ['available', 'sold'] },
          tags: { type: 'array', items: { type: 'string' } },
          active: { type: 'boolean' },
        },
      },
    },
  },
} as unknown as OpenAPIObject;

const json = (schema: SchemaObject | ReferenceObject) =>
  JSON.parse(GenerateExampleStringForSchema(schema, spec, Language.JSON)) as unknown;

describe('GenerateExampleStringForSchema', () => {
  it('generates examples for primitives, formats, enums and arrays', () => {
    expect(json({ $ref: '#/components/schemas/Pet' })).toEqual({
      id: 3,
      name: 'string',
      createdAt: '2024-01-01T00:00:00Z',
      status: 'available',
      tags: ['string'],
      active: true,
    });
  });

  it('prefers explicit examples, const and default values', () => {
    expect(json({ type: 'string', example: 'given' })).toBe('given');
    expect(json({ type: 'string', examples: ['first', 'second'] })).toBe('first');
    expect(json({ type: 'string', const: 'fixed' })).toBe('fixed');
    expect(json({ type: 'integer', default: 42 })).toBe(42);
  });

  it('merges allOf and picks the first branch of oneOf/anyOf', () => {
    expect(
      json({
        allOf: [
          { type: 'object', properties: { a: { type: 'string' } } },
          { type: 'object', properties: { b: { type: 'boolean' } } },
        ],
      })
    ).toEqual({ a: 'string', b: true });

    expect(json({ oneOf: [{ type: 'integer' }, { type: 'string' }] })).toBe(0);
    expect(json({ anyOf: [{ type: 'boolean' }, { type: 'string' }] })).toBe(true);
  });

  it('stops on circular references', () => {
    expect(json({ $ref: '#/components/schemas/Node' })).toEqual({ name: 'string', child: null });
  });

  it('supports type arrays and other output languages', () => {
    expect(json({ type: ['string', 'null'] })).toBe('string');
    expect(GenerateExampleStringForSchema({ type: 'object', properties: { a: { type: 'string' } } }, spec, Language.YAML))
      .toBe('a: string\n');
    expect(GenerateExampleStringForSchema(undefined, spec, Language.JSON)).toBe('');
  });
});
