import { OperationURLParams } from "@/components/Operation/Operation";
import { SchemaURLParams } from "@/components/Schema/Schema";
import { SpecContext } from "@/lib/context";
import { FindOperation, Operation, OperationKind } from "@/lib/operations";
import { GetRef } from "@/lib/ref";
import { ReferenceObject, SchemaObject } from "openapi3-ts/oas31";
import { useContext, useMemo } from "react";
import { useParams } from "react-router-dom";

export function useOperationFromRouter(kind: OperationKind = "path"): Operation | null {
  const params = useParams() as OperationURLParams;
  const { spec } = useContext(SpecContext);

  return useMemo(
    () => FindOperation(spec, kind, params?.method, params?.path && decodeURIComponent(params.path)),
    [kind, params?.method, params?.path, spec]
  );
}

export function useSchemaFromRouter(): { schema: SchemaObject | ReferenceObject, name: string } | null {
  const params = useParams() as SchemaURLParams;
  const { spec } = useContext(SpecContext);

  return useMemo(() => {
    if (!params?.name) return null;
    const decodedName = decodeURIComponent(params.name);

    const schema = spec?.components?.schemas?.[decodedName];
    if (!schema || !spec) return null;

    // Schemas may be declared as a reference to another schema
    return { schema: GetRef<SchemaObject>(schema, spec)[0], name: decodedName };
  }, [params?.name, spec])
}
