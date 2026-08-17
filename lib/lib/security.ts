import { GetRef } from '@/lib/ref';
import { OpenAPIObject, SecuritySchemeObject } from 'openapi3-ts/oas31';

// Security schemes may be declared as references, they are resolved once for the whole spec
export function ResolveSecuritySchemes(
  spec: OpenAPIObject | null
): Record<string, SecuritySchemeObject> {
  if (!spec) return {};

  return Object.fromEntries(
    Object.entries(spec.components?.securitySchemes ?? {}).flatMap(([name, scheme]) => {
      try {
        return [[name, GetRef<SecuritySchemeObject>(scheme, spec)[0]]];
      } catch {
        return []; // Ignore schemes with unresolvable references
      }
    })
  );
}
