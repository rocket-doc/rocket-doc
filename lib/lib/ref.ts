import { isReferenceObject, OpenAPIObject, ReferenceObject } from "openapi3-ts/oas31";

// Maximum number of chained references followed before considering the spec broken
const maxRefDepth = 100;

// Decodes a single JSON pointer token as described in RFC 6901
function decodePointerToken(token: string): string {
  return decodeURIComponent(token).replace(/~1/g, "/").replace(/~0/g, "~");
}

function resolvePointer(pointer: string, spec: OpenAPIObject): unknown {
  if (!pointer.startsWith("#/")) throw new Error(`External references are not supported: ${pointer}`);

  return pointer
    .slice("#/".length)
    .split("/")
    .map(decodePointerToken)
    .reduce<unknown>((current, token) => {
      if (current === null || typeof current !== "object") {
        throw new Error(`Reference not found: ${pointer}`);
      }
      const next = (current as Record<string, unknown>)[token];
      if (next === undefined) throw new Error(`Reference not found: ${pointer}`);
      return next;
    }, spec);
}

// GetRef resolves a (possibly chained) reference object against the spec.
// It returns the resolved object and the last reference path followed, or null when
// the given value was not a reference.
export function GetRef<T>(ref: T | ReferenceObject, spec: OpenAPIObject): [T, string | null] {
  let current: T | ReferenceObject = ref;
  let usedRef: string | null = null;

  const isRef = (value: unknown): value is ReferenceObject =>
    typeof value === "object" && value !== null && isReferenceObject(value);

  for (let depth = 0; isRef(current); depth++) {
    if (depth >= maxRefDepth) throw new Error(`Circular reference chain detected: ${current.$ref}`);
    usedRef = current.$ref;
    current = resolvePointer(current.$ref, spec) as T | ReferenceObject;
  }

  return [current as T, usedRef];
}
