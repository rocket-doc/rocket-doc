import { useParams } from "react-router-dom";
import { OperationURLParams } from "../../components/Operation/Operation";
import { useContext } from "react";
import { SpecContext } from "../context";
import { Operation, OperationFromObject } from "../operations";

export function useOperationFromRouter(): Operation | null {
  const params = useParams() as OperationURLParams;
  const { spec } = useContext(SpecContext);

  if (!params?.method || !params?.path) return null;
  const decodedPath = decodeURIComponent(params.path);

  if (!spec?.paths?.[decodedPath]?.[params.method]) return null;

  return OperationFromObject(params.method, decodedPath, spec.paths[decodedPath][params.method]);
}
