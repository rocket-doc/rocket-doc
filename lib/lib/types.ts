import {
  OpenAPIObject,
  ReferenceObject,
  SchemaObject,
} from 'openapi3-ts/oas31';
import { GetRef } from './ref';

export type EnumDetail = { varname: string, description?: string, value: any };

export type ParsedType = {
  fullTypeString: string;
  underlyingObject?: SchemaObject;
  underlyingObjects?: SchemaObject[];
  enumDetails?: EnumDetail[];
  isAllOf?: boolean;
  rootType: string;
  refStack?: string[];

  schema?: SchemaObject;
};

export function ParseType(
  schema: SchemaObject | ReferenceObject | undefined,
  spec: OpenAPIObject,
  currentRefStack?: string[]
): ParsedType {
  const [schemaResolved, usedRef] = GetRef(schema, spec);

  if (usedRef && currentRefStack?.includes(usedRef)) {
    return {
      fullTypeString: `circular reference [${usedRef}]`,
      refStack: currentRefStack,
      rootType: 'any',
    };
  }

  const refStack = [...(currentRefStack ?? [])];
  if (usedRef) refStack.push(usedRef);

  if (!schemaResolved) {
    return {
      fullTypeString: 'any',
      refStack: refStack,
      rootType: 'any',
    };
  }

  if (Array.isArray(schemaResolved.type)) {
    return {
      fullTypeString: 'one of',
      underlyingObjects: schemaResolved.type.map((type) => ({
        type,
        ...schemaResolved,
      })),
      refStack,
      rootType: 'oneOf',
      schema: schemaResolved,
    };
  }

  if (schemaResolved.const !== undefined) {
    return {
      fullTypeString: `${schemaResolved.const}`,
      refStack,
      rootType: 'const',
      schema: schemaResolved,
    };
  }

  if (schemaResolved.enum !== undefined) {
    return {
      fullTypeString: `possible values (${schemaResolved.type
        }): ${schemaResolved.enum.join(', ')}`,
      refStack,
      rootType: 'enum',
      schema: schemaResolved,
      enumDetails: parseEnumDetails(schemaResolved),
    };
  }

  if (IsSimpleType(schemaResolved)) {
    return {
      fullTypeString: schemaResolved.type,
      rootType: schemaResolved.type,
      schema: schemaResolved,
    };
  }

  if (schemaResolved.oneOf !== undefined) {
    return {
      fullTypeString: 'one of',
      underlyingObjects: schemaResolved.oneOf.map(
        (type) => GetRef(type, spec)[0]
      ),
      refStack,
      rootType: 'oneOf',
      schema: schemaResolved,
    };
  } else if (schemaResolved.allOf !== undefined) {
    return {
      fullTypeString: 'all of',
      underlyingObjects: schemaResolved.allOf.map(
        (type) => GetRef(type, spec)[0]
      ),
      refStack,
      rootType: 'allOf',
      schema: schemaResolved,
    };
  } else if (schemaResolved.type === 'object') {
    return {
      fullTypeString: 'object',
      underlyingObject: schemaResolved,
      rootType: 'object',
      refStack,
      schema: schemaResolved,
    };
  } else if (schemaResolved.type === 'array') {
    const parsedElementsType = ParseType(schemaResolved.items, spec);
    if (Array.isArray(parsedElementsType)) {
      return {
        fullTypeString: 'array of objects',
        underlyingObjects: parsedElementsType,
        rootType: 'array',
        refStack,
        schema: schemaResolved,
      };
    }
    return {
      ...parsedElementsType,
      fullTypeString: `array of ${parsedElementsType.fullTypeString}`,
      rootType: 'array',
      refStack,
      schema: schemaResolved,
    };
  }

  return {
    fullTypeString: 'any',
    refStack,
    rootType: 'any',
    schema: schemaResolved,
  };
}

export function IsAllOf(schema: SchemaObject): boolean {
  return (schema.allOf?.length ?? 0) > 0;
}

type SchemaObjectWithTypeString = SchemaObject & { type: string };

export function IsSimpleType(
  schema: SchemaObject
): schema is SchemaObjectWithTypeString {
  return !IsComplexType(schema);
}

export function IsComplexType(schema: SchemaObject): boolean {
  return (
    schema.type === 'object' ||
    schema.type === 'array' ||
    (schema.oneOf?.length ?? 0) > 0 ||
    (schema.allOf?.length ?? 0) > 0 ||
    Array.isArray(schema.type)
  );
}

function parseEnumDetails(schema: SchemaObject): EnumDetail[] | undefined {
  if (!schema.enum || (!schema["x-enum-descriptions"] && !schema["x-enum-varnames"])) return undefined;

  return schema.enum.map<EnumDetail>((value, index) => ({
    value,
    varname: schema["x-enum-varnames"]?.[index] ?? value,
    description: schema["x-enum-descriptions"]?.[index],
  }));
} 
