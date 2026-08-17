import { Language } from '@/lib/language';
import { XMLBuilder } from 'fast-xml-parser';
import {
  OpenAPIObject,
  ReferenceObject,
  SchemaObject,
} from 'openapi3-ts/oas31';
import { stringify as stringifyYAML } from 'yaml';
import { JsonValue } from './json';
import { GetRef } from './ref';

type GeneratedExample = { example: JsonValue; refStack: string[] };

// Values explicitly provided by the specification always win over generated ones
function providedExample(schema: SchemaObject): JsonValue | undefined {
  if (schema.example !== undefined) return schema.example as JsonValue;
  if (Array.isArray(schema.examples) && schema.examples.length > 0) return schema.examples[0] as JsonValue;
  if (schema.const !== undefined) return schema.const as JsonValue;
  if (schema.default !== undefined) return schema.default as JsonValue;
  if (schema.enum?.length) return schema.enum[0] as JsonValue;
  return undefined;
}

const formatExamples: Record<string, string> = {
  'date-time': '2024-01-01T00:00:00Z',
  date: '2024-01-01',
  time: '00:00:00',
  duration: 'P1D',
  email: 'user@example.com',
  uuid: '00000000-0000-0000-0000-000000000000',
  uri: 'https://example.com',
  'uri-reference': '/example',
  hostname: 'example.com',
  ipv4: '127.0.0.1',
  ipv6: '::1',
  password: 'password',
  byte: 'ZXhhbXBsZQ==',
  binary: 'binary',
};

function stringExample(schema: SchemaObject): string {
  return (schema.format ? formatExamples[schema.format] : undefined) ?? 'string';
}

// Composed schemas (allOf/oneOf/anyOf) are merged or reduced to their first branch
function composedSchemas(schema: SchemaObject): (SchemaObject | ReferenceObject)[] | undefined {
  if (schema.allOf?.length) return schema.allOf;
  if (schema.oneOf?.length) return [schema.oneOf[0]];
  if (schema.anyOf?.length) return [schema.anyOf[0]];
  return undefined;
}

function GenerateExampleForSchema(
  obj: SchemaObject,
  spec: OpenAPIObject,
  refStack: string[]
): GeneratedExample {
  const provided = providedExample(obj);
  if (provided !== undefined) return { example: provided, refStack };

  const composed = composedSchemas(obj);
  if (composed) {
    return composed.reduce<GeneratedExample>((merged, subSchema) => {
      const [schema, usedRef] = GetRef(subSchema, spec);
      if (usedRef && merged.refStack.includes(usedRef)) return merged; // Avoid circular references
      const generated = GenerateExampleForSchema(
        schema,
        spec,
        usedRef ? [usedRef, ...merged.refStack] : merged.refStack
      );
      if (
        typeof merged.example === 'object' && merged.example !== null && !Array.isArray(merged.example) &&
        typeof generated.example === 'object' && generated.example !== null && !Array.isArray(generated.example)
      ) {
        return { example: { ...merged.example, ...generated.example }, refStack: generated.refStack };
      }
      return generated;
    }, { example: {}, refStack });
  }

  const type = Array.isArray(obj.type) ? obj.type[0] : obj.type;
  switch (type) {
    case 'string':
      return { example: stringExample(obj), refStack };
    case 'number':
    case 'integer':
      return { example: obj.minimum ?? 0, refStack };
    case 'boolean':
      return { example: true, refStack };
    case 'null':
      return { example: null, refStack };
    case 'array': {
      if (!obj.items) return { example: [], refStack };

      const [schema, usedRef] = GetRef(obj.items, spec);
      if (usedRef) {
        if (refStack.includes(usedRef)) return { example: [], refStack }; // Avoid circular references
        refStack = [usedRef, ...refStack];
      }
      const { example: itemsExample, refStack: itemsRefStack } =
        GenerateExampleForSchema(schema, spec, refStack);
      return { example: [itemsExample], refStack: itemsRefStack };
    }
    case 'object': {
      if (!obj.properties) return { example: {}, refStack };

      const example: { [key: string]: JsonValue } = {};
      for (const [key, value] of Object.entries(obj.properties)) {
        let propertyRefStack = [...refStack];
        const [schema, usedRef] = GetRef(value, spec);
        if (usedRef) {
          if (propertyRefStack.includes(usedRef)) {
            example[key] = null; // Avoid circular references
            continue;
          }
          propertyRefStack = [usedRef, ...propertyRefStack];
        }
        const { example: propExample, refStack: propRefStack } =
          GenerateExampleForSchema(schema, spec, propertyRefStack);
        example[key] = propExample;
        refStack = propRefStack;
      }
      return { example, refStack };
    }
    default:
      return { example: null, refStack };
  }
}

export function GenerateExampleStringForSchema(
  obj: SchemaObject | ReferenceObject | undefined,
  spec: OpenAPIObject,
  language: Language
): string {
  if (!obj) return '';

  const [schema, usedRef] = GetRef(obj, spec);

  const { example } = GenerateExampleForSchema(
    schema,
    spec,
    usedRef ? [usedRef] : []
  );
  switch (language) {
    case Language.JSON:
      return JSON.stringify(example, null, 2);
    case Language.YAML:
      return stringifyYAML(example, { indent: 2 });
    case Language.XML:
      return new XMLBuilder({ format: true }).build(example) as string;
    default:
      return '';
  }
}
