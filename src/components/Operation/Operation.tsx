import { HttpMethod } from "../../lib/operations";
import { Markdown } from "../Markdown";
import { useOperationFromRouter } from "../../lib/hooks/operation_router";
import { Card, CardBody, CardHeader, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@nextui-org/react";
import { Parameters } from "../Parameters/Parameters";
import { Schema } from "../Schema/Schema";
import { useContext } from "react";
import { SpecContext } from "../../lib/context";
import { GetRef } from "../../lib/ref";

export type OperationURLParams = {
  method: HttpMethod;
  path: string;
}

export function Operation() {
  const operation = useOperationFromRouter();
  const { spec } = useContext(SpecContext);

  if (!operation || !spec) return null;

  const bodyObj = GetRef(operation.requestBody, spec);
  return (
    <div>
      <div>
        <h1 className="text-3xl font-bold">
          <span className={`httpmethod-${operation.method.toLowerCase()} uppercase`}>
            {operation.method}
          </span>
          <span className="ml-2 text-gray-500">{operation.path}</span>
        </h1>
      </div>
      <h1>{operation.summary}</h1>
      {operation.description && <>
        <h2 className="text-2xl">Description</h2>
        <Markdown contentMd={operation.description} />
      </>}
      {operation.parameters && <>
        <h2 className="text-2xl">Parameters</h2>
        <Parameters parameters={operation.parameters} />
      </>}
      {bodyObj && <>
        <h2 className="text-2xl">Request Body</h2>
        {Object.entries(bodyObj.content).map(([mediaType, mediaObj]) => {
          return <Card key={mediaType} className="my-2">
            <CardHeader>Content-Type: {mediaType}</CardHeader>
            <CardBody>
              <Schema schema={mediaObj.schema} spec={spec} />
            </CardBody>
          </Card>
        })}
      </>}
    </div>
  )
}
