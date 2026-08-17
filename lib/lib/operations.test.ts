import { OpenAPIObject, ParameterObject } from 'openapi3-ts/oas31';
import { describe, expect, it } from 'vitest';
import {
  ExtractOperations,
  ExtractWebhooks,
  FindOperation,
  FlattenOperations,
  OperationRoute,
} from './operations';

const spec = {
  openapi: '3.1.0',
  info: { title: 'test', version: '1' },
  servers: [{ url: 'https://api.test' }],
  tags: [{ name: 'pets' }, { name: 'store' }],
  paths: {
    '/pets/{id}': {
      parameters: [
        { name: 'id', in: 'path', required: true, description: 'from path item' },
        { name: 'trace', in: 'header' },
      ],
      servers: [{ url: 'https://pets.test' }],
      get: {
        operationId: 'getPet',
        tags: ['pets'],
        summary: 'Get a pet',
        parameters: [{ name: 'id', in: 'path', required: true, description: 'from operation' }],
      },
      delete: {
        operationId: 'deletePet',
        tags: ['store', 'pets'],
        servers: [{ url: 'https://admin.test' }],
      },
    },
    '/health': { get: { operationId: 'health' } },
  },
  webhooks: {
    petCreated: { post: { operationId: 'onPetCreated', tags: ['pets'] } },
  },
} as unknown as OpenAPIObject;

describe('OperationRoute', () => {
  it('builds path and webhook routes', () => {
    expect(OperationRoute({ kind: 'path', method: 'get', path: '/pets/{id}' })).toBe(
      '/operations/get/%2Fpets%2F%7Bid%7D'
    );
    expect(OperationRoute({ kind: 'webhook', method: 'post', path: 'petCreated' })).toBe(
      '/webhooks/post/petCreated'
    );
  });
});

describe('FindOperation', () => {
  it('finds a path operation and merges path level parameters', () => {
    const operation = FindOperation(spec, 'path', 'get', '/pets/{id}');
    expect(operation?.operationId).toBe('getPet');
    const parameters = operation?.parameters as ParameterObject[];
    expect(parameters).toHaveLength(2);
    expect(parameters.find((p) => p.name === 'id')?.description).toBe('from operation');
    expect(parameters.find((p) => p.name === 'trace')).toBeDefined();
  });

  it('inherits servers from the path item and the spec', () => {
    expect(FindOperation(spec, 'path', 'get', '/pets/{id}')?.servers).toEqual([{ url: 'https://pets.test' }]);
    expect(FindOperation(spec, 'path', 'delete', '/pets/{id}')?.servers).toEqual([{ url: 'https://admin.test' }]);
    expect(FindOperation(spec, 'path', 'get', '/health')?.servers).toEqual([{ url: 'https://api.test' }]);
  });

  it('finds webhooks separately from paths', () => {
    expect(FindOperation(spec, 'webhook', 'post', 'petCreated')?.operationId).toBe('onPetCreated');
    expect(FindOperation(spec, 'path', 'post', 'petCreated')).toBeNull();
  });

  it('returns null on unknown or invalid lookups', () => {
    expect(FindOperation(spec, 'path', 'get', '/unknown')).toBeNull();
    expect(FindOperation(spec, 'path', 'connect', '/pets/{id}')).toBeNull();
    expect(FindOperation(null, 'path', 'get', '/health')).toBeNull();
    expect(FindOperation(spec, 'path', undefined, '/health')).toBeNull();
  });
});

describe('ExtractOperations', () => {
  it('groups operations by tag, following the declared tag order', () => {
    expect(ExtractOperations(spec).map(({ tag }) => tag)).toEqual(['pets', 'store', '']);
  });

  it('lists untagged operations under the tagless group', () => {
    const tagless = ExtractOperations(spec).find(({ tag }) => tag === '');
    expect(tagless?.operations.map(({ operationId }) => operationId)).toEqual(['health']);
  });

  it('filters on path, method, id, summary and tags', () => {
    const ids = (filter: string) =>
      FlattenOperations(ExtractOperations(spec, filter)).map(({ operationId }) => operationId);

    expect(ids('/health')).toEqual(['health']);
    expect(ids('DELETE')).toEqual(['deletePet']);
    expect(ids('getpet')).toEqual(['getPet']);
    expect(ids('get a pet')).toEqual(['getPet']);
    expect(ids('store')).toEqual(['deletePet']);
    expect(ids('nothing matches')).toEqual([]);
  });
});

describe('ExtractWebhooks', () => {
  it('extracts webhook operations', () => {
    const webhooks = ExtractWebhooks(spec);
    expect(webhooks).toHaveLength(1);
    expect(webhooks[0].operations[0]).toMatchObject({ kind: 'webhook', path: 'petCreated', method: 'post' });
  });
});

describe('FlattenOperations', () => {
  it('deduplicates operations listed under several tags', () => {
    const ids = FlattenOperations(ExtractOperations(spec)).map(({ id }) => id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain('path_delete_/pets/{id}');
  });
});
