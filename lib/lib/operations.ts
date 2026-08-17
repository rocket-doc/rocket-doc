import {
  OpenAPIObject,
  OperationObject,
  ParameterObject,
  PathItemObject,
  PathsObject,
  ReferenceObject,
  ServerObject,
} from 'openapi3-ts/oas31';
import { GetRef } from './ref';

export const HttpMethods = [
  'get',
  'put',
  'post',
  'delete',
  'options',
  'head',
  'patch',
  'trace',
] as const;
export type HttpMethod = (typeof HttpMethods)[number];

// Operations are either declared under `paths` or under `webhooks` (OpenAPI 3.1)
export type OperationKind = 'path' | 'webhook';

export type Operation = {
  id: string;
  kind: OperationKind;
  // Path of the operation, or name of the webhook
  path: string;
  method: HttpMethod;
  // Parameters & servers are resolved from both the path item and the operation itself
  parameters?: (ParameterObject | ReferenceObject)[];
  servers?: ServerObject[];
} & OperationObject;

export type OperationsByTag = {
  tag: string;
  operations: Operation[];
}[];

export const taglessTag = '';

export function OperationRoute(operation: Pick<Operation, 'kind' | 'method' | 'path'>): string {
  const prefix = operation.kind === 'webhook' ? 'webhooks' : 'operations';
  return `/${prefix}/${operation.method}/${encodeURIComponent(operation.path)}`;
}

function includesInsensitive(value: string | undefined, filter: string): boolean {
  return value?.toLowerCase().includes(filter) ?? false;
}

function filterOperation(operation: Operation, filter: string): boolean {
  if (filter === '') return true;
  const sanitized = filter.toLowerCase().trim();
  return (
    includesInsensitive(operation.path, sanitized) ||
    includesInsensitive(operation.method, sanitized) ||
    includesInsensitive(operation.operationId, sanitized) ||
    includesInsensitive(operation.summary, sanitized) ||
    includesInsensitive(operation.description, sanitized) ||
    (operation.tags?.some((tag) => includesInsensitive(tag, sanitized)) ?? false)
  );
}

// Parameters declared on the path item apply to every operation of that path,
// operation level parameters take precedence over path level ones (same name & location)
function mergeParameters(
  pathItemParameters: (ParameterObject | ReferenceObject)[] | undefined,
  operationParameters: (ParameterObject | ReferenceObject)[] | undefined,
  spec: OpenAPIObject
): (ParameterObject | ReferenceObject)[] | undefined {
  if (!pathItemParameters?.length) return operationParameters;
  if (!operationParameters?.length) return pathItemParameters;

  const identifier = (parameter: ParameterObject | ReferenceObject): string => {
    try {
      const resolved = GetRef<ParameterObject>(parameter, spec)[0];
      return `${resolved.name}__${resolved.in}`;
    } catch {
      return JSON.stringify(parameter);
    }
  };

  const overridden = new Set(operationParameters.map(identifier));
  return [
    ...pathItemParameters.filter((parameter) => !overridden.has(identifier(parameter))),
    ...operationParameters,
  ];
}

export function OperationFromPathItem(
  kind: OperationKind,
  path: string,
  method: HttpMethod,
  pathItem: PathItemObject,
  spec: OpenAPIObject
): Operation | null {
  const operationObj = pathItem[method];
  if (!operationObj) return null;

  return {
    ...operationObj,
    id: `${kind}_${method}_${path}`,
    kind,
    path,
    method,
    parameters: mergeParameters(pathItem.parameters, operationObj.parameters, spec),
    servers: operationObj.servers ?? pathItem.servers ?? spec.servers,
  };
}

// FindOperation looks up a single operation in the spec, it returns null when it does not exist
export function FindOperation(
  spec: OpenAPIObject | null,
  kind: OperationKind,
  method: string | undefined,
  path: string | undefined
): Operation | null {
  if (!spec || !method || !path) return null;
  if (!HttpMethods.includes(method as HttpMethod)) return null;

  const source = kind === 'webhook' ? spec.webhooks : spec.paths;
  const pathItemOrRef = source?.[path];
  if (!pathItemOrRef) return null;

  const pathItem = GetRef<PathItemObject>(pathItemOrRef, spec)[0];
  return OperationFromPathItem(kind, path, method as HttpMethod, pathItem, spec);
}

// Tags are ordered as declared in the spec `tags` field, undeclared tags are appended
function sortByDeclaredTags(operationsByTag: OperationsByTag, spec: OpenAPIObject): OperationsByTag {
  const declaredTags = (spec.tags ?? []).map(({ name }) => name);
  return [...operationsByTag].sort((a, b) => {
    const indexA = declaredTags.indexOf(a.tag);
    const indexB = declaredTags.indexOf(b.tag);
    if (indexA === indexB) return 0;
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });
}

function extract(
  source: PathsObject | Record<string, PathItemObject | ReferenceObject> | undefined,
  kind: OperationKind,
  spec: OpenAPIObject,
  filter: string
): OperationsByTag {
  const operationsByTag = new Map<string, Operation[]>();

  Object.entries(source ?? {}).forEach(([path, pathItemOrRef]) => {
    let pathItem: PathItemObject;
    try {
      pathItem = GetRef<PathItemObject>(pathItemOrRef, spec)[0];
    } catch {
      return; // Ignore path items with unresolvable references
    }

    HttpMethods.forEach((method) => {
      const operation = OperationFromPathItem(kind, path, method, pathItem, spec);
      if (!operation || !filterOperation(operation, filter)) return;

      for (const tag of operation.tags?.length ? operation.tags : [taglessTag]) {
        if (!operationsByTag.has(tag)) operationsByTag.set(tag, []);
        operationsByTag.get(tag)!.push(operation);
      }
    });
  });

  return sortByDeclaredTags(
    Array.from(operationsByTag, ([tag, operations]) => ({ tag, operations })),
    spec
  );
}

// ExtractOperations returns the operations declared under `paths`, grouped by tag
export function ExtractOperations(spec: OpenAPIObject | null, filter = ''): OperationsByTag {
  if (!spec) return [];
  return extract(spec.paths, 'path', spec, filter);
}

// ExtractWebhooks returns the operations declared under `webhooks`, grouped by tag
export function ExtractWebhooks(spec: OpenAPIObject | null, filter = ''): OperationsByTag {
  if (!spec) return [];
  return extract(spec.webhooks, 'webhook', spec, filter);
}

export function FlattenOperations(operationsByTag: OperationsByTag): Operation[] {
  const seen = new Set<string>();
  return operationsByTag
    .flatMap(({ operations }) => operations)
    .filter((operation) => {
      if (seen.has(operation.id)) return false;
      seen.add(operation.id);
      return true;
    });
}
