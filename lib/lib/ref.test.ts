import { OpenAPIObject } from 'openapi3-ts/oas31';
import { describe, expect, it } from 'vitest';
import { GetRef } from './ref';

const spec = {
  openapi: '3.1.0',
  info: { title: 'test', version: '1' },
  paths: {
    '/pets/{id}': { get: { operationId: 'getPet' } },
  },
  components: {
    schemas: {
      Pet: { type: 'object', properties: { name: { type: 'string' } } },
      Alias: { $ref: '#/components/schemas/Pet' },
      Loop: { $ref: '#/components/schemas/Loop' },
      'weird~name/with': { type: 'string' },
    },
  },
} as unknown as OpenAPIObject;

describe('GetRef', () => {
  it('returns non references as is', () => {
    const schema = { type: 'string' };
    expect(GetRef(schema, spec)).toEqual([schema, null]);
  });

  it('resolves a local reference', () => {
    expect(GetRef({ $ref: '#/components/schemas/Pet' }, spec)).toEqual([
      spec.components?.schemas?.Pet,
      '#/components/schemas/Pet',
    ]);
  });

  it('follows chained references', () => {
    const [resolved, usedRef] = GetRef({ $ref: '#/components/schemas/Alias' }, spec);
    expect(resolved).toEqual(spec.components?.schemas?.Pet);
    expect(usedRef).toBe('#/components/schemas/Pet');
  });

  it('unescapes JSON pointer tokens', () => {
    expect(GetRef({ $ref: '#/paths/~1pets~1%7Bid%7D/get' }, spec)[0]).toEqual({ operationId: 'getPet' });
    expect(GetRef({ $ref: '#/components/schemas/weird~0name~1with' }, spec)[0]).toEqual({ type: 'string' });
  });

  it('throws on unknown references', () => {
    expect(() => GetRef({ $ref: '#/components/schemas/Unknown' }, spec)).toThrow(/Reference not found/);
  });

  it('throws on external references', () => {
    expect(() => GetRef({ $ref: 'other.yaml#/Pet' }, spec)).toThrow(/External references are not supported/);
  });

  it('throws on circular reference chains', () => {
    expect(() => GetRef({ $ref: '#/components/schemas/Loop' }, spec)).toThrow(/Circular reference/);
  });
});
