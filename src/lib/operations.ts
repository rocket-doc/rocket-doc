import { OperationObject, PathItemObject, PathsObject } from "openapi3-ts/oas31";

export const HttpMethods: (keyof PathItemObject)[] = ["get", "put", "post", "delete", "options", "head", "patch", "trace"];
export type HttpMethod = typeof HttpMethods[number];

export type Operation = {
  id : string,
  path : string,
  method: HttpMethod,
} & OperationObject;

export function ExtractOperations( paths: PathsObject ): Operation[] {
  return Object.entries(paths).map(([path, methods]) => {
    let out: Operation[] = [];
    HttpMethods.forEach((method) => {
      if (methods[method]) {
        out.push(OperationFromObject(method, path, methods[method]));
      }
    })
    return out;
   }).flat()
}

export function OperationFromObject(method: string, path: string, operationObj: OperationObject): Operation {
  return { id: `${method}_${path}`, path, method: method as HttpMethod, ...operationObj };
}
