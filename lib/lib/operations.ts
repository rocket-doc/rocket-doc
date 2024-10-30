import {
  OperationObject,
  PathItemObject,
  PathsObject,
} from 'openapi3-ts/oas31';

export const HttpMethods: (keyof PathItemObject)[] = [
  'get',
  'put',
  'post',
  'delete',
  'options',
  'head',
  'patch',
  'trace',
];
export type HttpMethod = (typeof HttpMethods)[number];

export type Operation = {
  id: string;
  path: string;
  method: HttpMethod;
} & OperationObject;

export type OperationsByTag = {
  tag: string;
  operations: Operation[];
}[];

function filterOperation(operation: Operation, filter: string): boolean {
  if (filter === '') return true;
  const filterSanitized = filter.toLowerCase();
  return (
    operation.path.toLowerCase().includes(filterSanitized) ||
    operation.summary?.includes(filter) ||
    operation.description?.includes(filter) ||
    operation.tags?.some((tag) => tag.includes(filter)) ||
    false
  );
}

export function ExtractOperations(
  paths: PathsObject,
  filter: string
): OperationsByTag {
  const operationsTagsMap = new Map<string, Operation[]>();
  Object.entries(paths).forEach(([path, methods]) => {
    HttpMethods.forEach((method) => {
      if (methods[method]) {
        const operation = OperationFromObject(method, path, methods[method]);
        if (!filterOperation(operation, filter)) return;

        for (const tag of operation.tags ?? ['']) {
          if (!operationsTagsMap.has(tag)) {
            operationsTagsMap.set(tag, []);
          }
          operationsTagsMap.get(tag)!.push(operation);
        }
      }
    });
  });
  let operationsByTag: OperationsByTag = [];
  operationsTagsMap.forEach((operations, tag) => {
    operationsByTag.push({ tag, operations });
  });
  return operationsByTag;
}

export function OperationFromObject(
  method: string,
  path: string,
  operationObj: OperationObject
): Operation {
  return {
    id: `${method}_${path}`,
    path,
    method: method as HttpMethod,
    ...operationObj,
  };
}
