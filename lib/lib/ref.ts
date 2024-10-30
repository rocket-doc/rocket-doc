import { isReferenceObject, OpenAPIObject, ReferenceObject } from "openapi3-ts/oas31";

// GetRef takes a reference object and a spec and returns the resolved object and the reference path
export function GetRef<T>(ref: T | ReferenceObject, spec: OpenAPIObject): [T, string | null]{
  if (!ref || !isReferenceObject(ref)) return [ref, null];
  if (!ref.$ref.startsWith("#/")) throw new Error(`External references must start with "#/": ${ref.$ref}`);

  let path = ref.$ref.slice("#/".length).split("/");
  let out: any = spec;
  path.forEach((p) => {
    out = out[p];
    if(!out) throw new Error(`Reference not found: ${ref.$ref}`);
  });
  return [out as T, ref.$ref];
}
