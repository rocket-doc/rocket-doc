import { SpecContext } from "@/lib/context";
import { useSchemaFromRouter } from "@/lib/hooks/router";
import { ParseType } from "@/lib/types";
import { Divider } from "antd";
import { OpenAPIObject, ReferenceObject, SchemaObject } from "openapi3-ts/oas31";
import { useContext } from "react";
import { MarkdownWithUrl } from "../MarkdownWithUrl";
import { ColoredType } from "./ColoredType";
import { Field } from "./Field/Field";
import { ObjectRows } from "./Object";

type SchemaProps = {
  schema?: SchemaObject | ReferenceObject;
  spec: OpenAPIObject;
}


export function Schema({ schema, spec }: SchemaProps) {
  if (!schema || !spec) return null;

  const parsedType = ParseType(schema, spec);

  if (!parsedType.underlyingObject && !parsedType.underlyingObjects) return <ColoredType type={parsedType.fullTypeString} rootType={parsedType.rootType} />;
  return (
    <>
      <table>
        <tbody>
          <ObjectRows depth={0} type={parsedType} spec={spec} />
        </tbody>
      </table>
    </>)
}

export type SchemaURLParams = {
  name: string;
}

export function SchemaRoute() {
  const schemaInfos = useSchemaFromRouter();
  const { spec } = useContext(SpecContext);

  if (!schemaInfos || !spec) return null;

  const { schema, name } = schemaInfos;
  const parsedType = ParseType(schema, spec, []);

  return (
    <div className="mt-1">
      <h1 className="text-2xl">Schema of: {name} </h1>
      {schema.description && <MarkdownWithUrl>{schema.description}</MarkdownWithUrl>}
      <Divider />
      {
        parsedType.underlyingObjects ? <h3 className="my-1 text-xl">{parsedType.isAllOf ? "All of" : "One of"}</h3> : null
      }
      <table>
        <tbody>
          <Field spec={spec} type={parsedType} depth={0} hideBase name={name} />
        </tbody>
      </table>
    </div>)
}



