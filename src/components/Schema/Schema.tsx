import { OpenAPIObject, ReferenceObject, SchemaObject, SchemaObjectType } from "openapi3-ts/oas31"
import { GetRef } from "../../lib/ref";
import { Accordion, AccordionItem, Card, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@nextui-org/react";

type SchemaProps = {
  schema?: SchemaObject | ReferenceObject;
  spec: OpenAPIObject;
}

export function SchemaCollapsable({ title, ...props }: SchemaProps & { title?: string }) {
  return (<Accordion>
    <AccordionItem title={title ?? "Schema"}>
      <Schema {...props} />
    </AccordionItem>
  </Accordion>)
}

export function Schema({ schema, spec }: SchemaProps) {
  if (!schema || !spec) return null;

  const schemaObj = GetRef(schema, spec);
  switch (schemaObj.type) {
    case "object":
      const properties = { ...schemaObj.properties };
      if (schemaObj.additionalProperties && typeof schemaObj.additionalProperties === "object") {
        properties["[any-key]"] = schemaObj.additionalProperties;
      } else if (schemaObj.additionalProperties) {
        properties["[any-key]"] = { type: "any" as SchemaObjectType }
      }
      return (
        <div>
          <Table>
            <TableHeader>
              <TableColumn>Name</TableColumn>
              <TableColumn>Type</TableColumn>
            </TableHeader>
            <TableBody>
              {Object.entries(properties).map(([name, prop], i) => {
                return (
                  <TableRow key={i}>
                    <TableCell>{name}</TableCell>
                    <TableCell><Schema schema={prop} spec={spec} /></TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )
    case "array":
      if (!schemaObj.items) return null;
      let itemsObj = GetRef(schemaObj.items, spec);
      if (itemsObj.type === "object" || itemsObj.type === "array") {
        return (
          <div>
            <h2>Array of:</h2>
            <Card>
              <Schema schema={schemaObj.items} spec={spec} />
            </Card>
          </div>
        )
      }


      return (
        <div>
          <h2>[]{itemsObj.type}</h2>
        </div>
      )
    case "null":
      return (
        <div>
          <h2>Null</h2>
        </div>
      )
    default:
      return (
        <div>
          <h2>{schemaObj.type}</h2>
        </div>
      )
  }
}
