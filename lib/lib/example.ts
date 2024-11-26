import { Language } from '@/components/Code/CodeEditor';
import { XMLBuilder } from 'fast-xml-parser';
import {
  OpenAPIObject,
  ReferenceObject,
  SchemaObject,
} from 'openapi3-ts/oas31';
import { stringify as stringifyYAML } from 'yaml';
import { GetRef } from './ref';

function GenerateExampleForSchema(
  obj: SchemaObject,
  spec: OpenAPIObject,
  refStack: string[]
): { example: any; refStack: string[] } {
  if (obj.example) return { example: obj.example, refStack };
  let example: Record<string, any> = {};
  switch (obj.type) {
    case 'string':
      return { example: 'string', refStack };
    case 'number':
    case 'integer':
      return { example: 0, refStack };
    case 'boolean':
      return { example: true, refStack };
    case 'null':
      return { example: null, refStack };
    case 'array':
      if (!obj.items) return { example: [], refStack };

      const [schema, usedRef] = GetRef(obj.items, spec);
      if (usedRef) {
        if (refStack.includes(usedRef)) return { example: [], refStack }; // Avoid circular references
        refStack = [usedRef, ...refStack];
      }
      const { example: itemsExample, refStack: itemsRefStack } =
        GenerateExampleForSchema(schema, spec, refStack);
      return { example: [itemsExample], refStack: itemsRefStack };
    case 'object':
      if (!obj.properties) return { example: {}, refStack };

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
