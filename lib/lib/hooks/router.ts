import { OperationURLParams } from "@/components/Operation/Operation";
import { SchemaURLParams } from "@/components/Schema/Schema";
import { SpecContext } from "@/lib/context";
import { Operation, OperationFromObject } from "@/lib/operations";
import { ReferenceObject, SchemaObject } from "openapi3-ts/oas31";
import { useContext, useMemo } from "react";
import { useParams } from "react-router-dom";

export function useOperationFromRouter(): Operation | null {
  const params = useParams() as OperationURLParams;
  const { spec } = useContext(SpecContext);

  return useMemo(() => {
    if (!params?.method || !params?.path) return null;
    const decodedPath = decodeURIComponent(params.path);

    if (!spec?.paths?.[decodedPath]?.[params.method]) return null;
    return OperationFromObject(params.method, decodedPath, spec.paths[decodedPath][params.method])
  }, [params.method, params.path, spec])
}

export function useSchemaFromRouter(): { schema: SchemaObject | ReferenceObject, name: string } | null {
  const params = useParams() as SchemaURLParams;
  const { spec } = useContext(SpecContext);

  return useMemo(() => {
    if (!params?.name) return null;
    const decodedName = decodeURIComponent(params.name);

    if (!spec?.components?.schemas?.[decodedName]) return null

    return { schema: spec?.components?.schemas?.[decodedName], name: decodedName };
  }, [params.name, spec])
}
