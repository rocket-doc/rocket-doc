import { Card, CardBody, CardHeader, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@nextui-org/react";
import { isReferenceObject, ParameterObject, ReferenceObject } from "openapi3-ts/oas31";
import { useContext } from "react";
import { SpecContext } from "../../lib/context";
import { GetRef } from "../../lib/ref";
import { Schema } from "../Schema/Schema";

type ParametersProps = {
  parameters?: (ParameterObject | ReferenceObject)[];
}

export function Parameters({ parameters }: ParametersProps) {
  const { spec } = useContext(SpecContext);
  if (!parameters || !spec) return null;

  return (<Table className="my-2">
    <TableHeader>
      <TableColumn>Parameter</TableColumn>
      <TableColumn>Type</TableColumn>
    </TableHeader>
    <TableBody>
      {parameters.map((param, i) => {
        const paramObj = GetRef(param, spec);
        return (<TableRow key={i}>
          <TableCell>{paramObj.name}</TableCell>
          <TableCell>
            {paramObj.schema ? <Schema schema={paramObj.schema} spec={spec} /> : (
              Object.entries(paramObj.content ?? {}).map(([name, content], i) => (
                <Card key={i}>
                  <CardHeader>
                    Content-Type: {name}
                  </CardHeader>
                  <CardBody>
                    <Schema schema={content.schema} spec={spec} />
                  </CardBody>
                </Card>
              ))
            )}
          </TableCell>
        </TableRow>)
      })}
    </TableBody>
  </Table>)

}
