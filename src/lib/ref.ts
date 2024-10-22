import { isReferenceObject, OpenAPIObject, ReferenceObject } from "openapi3-ts/oas31";

export function GetRef<T>(ref: T | ReferenceObject, spec: OpenAPIObject): T{
  if (!ref || !isReferenceObject(ref)) return ref;
  if (!ref.$ref.startsWith("#/")) throw new Error(`External references must start with "#/": ${ref.$ref}`);

  let path = ref.$ref.slice("#/".length).split("/");
  let out: any = spec;
  path.forEach((p) => {
    out = out[p];
    if(!out) throw new Error(`Reference not found: ${ref.$ref}`);
  });
  return out as T;
}
