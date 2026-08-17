import { OpenAPIObject } from 'openapi3-ts/oas31';
import { parse as parseYaml } from 'yaml';
import { IsYamlMediaType } from './media_type';

// ParseSpecContent parses a raw specification document.
// YAML is used when the content type (or the file name) says so, JSON otherwise.
// YAML being a superset of JSON, YAML parsing is also used as a fallback for invalid JSON.
export function ParseSpecContent(content: string, hint?: string | null): OpenAPIObject {
  if (IsYamlMediaType(hint) || /\.(ya?ml)$/i.test(hint ?? '')) {
    return parseYaml(content) as OpenAPIObject;
  }

  try {
    return JSON.parse(content) as OpenAPIObject;
  } catch {
    return parseYaml(content) as OpenAPIObject;
  }
}
