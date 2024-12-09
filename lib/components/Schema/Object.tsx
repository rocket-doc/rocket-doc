import { ParsedType, ParseType } from "@/lib/types";
import { OpenAPIObject, SchemaObjectType } from "openapi3-ts/oas31";
import { ReactNode } from "react";
import { MarkdownWithUrl } from "../MarkdownWithUrl";
import { Field } from "./Field/Field";

type ObjectRowsProps = {
  type: ParsedType;
  depth: number;
  spec: OpenAPIObject;
}

export function ObjectRows({ type, depth, spec }: ObjectRowsProps): ReactNode {
  if (!type.underlyingObject) return null;

  const properties = { ...type.underlyingObject.properties };
  if (type.underlyingObject.additionalProperties && typeof type.underlyingObject.additionalProperties === "object") {
    properties["[any-key]"] = type.underlyingObject.additionalProperties;
  } else if (type.underlyingObject.additionalProperties) {
    properties["[any-key]"] = { type: "any" as SchemaObjectType }
  }

  return <>
    {type.underlyingObject.description && <tr>
      <td colSpan={2} className="py-1 italic" style={{
        paddingLeft: '1em',
        marginLeft: '15px'
      }}>
        <MarkdownWithUrl className="text-xs">{type.underlyingObject.description}</MarkdownWithUrl>
      </td>
    </tr>}
    {Object.entries(properties).map(([name, prop]) => {
      const parsedPropType = ParseType(prop, spec, type.refStack);
      return <Field
        key={name}
        name={name}
        type={parsedPropType}
        depth={depth}
        spec={spec}
      />
    })}
  </>
}
