import { ParsedType, ParseType } from "@/lib/types";
import { OpenAPIObject } from "openapi3-ts/oas31";
import { Fragment, ReactNode } from "react";
import { ColoredType } from "../ColoredType";
import { ObjectRows } from "../Object";

type FieldUnderlyingProps = {
  depth: number;
  spec: OpenAPIObject;
  type: ParsedType;
}

export function FieldUnderlying({
  depth,
  spec,
  type,
}: FieldUnderlyingProps): ReactNode {
  if (type.underlyingObjects) {
    return type.underlyingObjects.map((o, i) => {
      const parsedUnderlying = ParseType(o, spec, type.refStack);
      const underlyingIsObject = parsedUnderlying.underlyingObject !== undefined;
      return (<Fragment key={`oneof_${i}`}>
        <tr className="border-b border-b-gray-300 dark:border-b-gray-600" >
          <td colSpan={underlyingIsObject ? 2 : 1} className={`pl-${2 * depth} my-1`} style={{
            paddingLeft: `${depth + 2}em`
          }}>
            {o.title || `One Of ${i}`}
          </td>
          {!underlyingIsObject && <td className="pl-1">
            <ColoredType type={parsedUnderlying.fullTypeString} rootType={parsedUnderlying.rootType} />
          </td>}
        </tr>
        <ObjectRows
          type={parsedUnderlying}
          depth={depth + 1}
          spec={spec}
        />
      </Fragment>)
    })
  }

  // if the field is a simple object, we only need to render a single set of rows
  return (<ObjectRows
    type={ParseType(type.underlyingObject!, spec, type.refStack)}
    depth={depth + 1}
    spec={spec}
  />)
}
