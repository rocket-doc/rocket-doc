import { ConfigContext, ExtensionsContext } from "@/lib/context";
import { ParsedType } from "@/lib/types";
import { OpenAPIObject } from "openapi3-ts/oas31";
import { ReactNode, useContext, useState } from "react";
import { FieldBase } from "./Base";
import { EnumDetails } from "./EnumDetails";
import { FieldUnderlying } from "./Underlying";

type FieldProps = {
  name: string;
  type: ParsedType;
  depth: number;
  spec: OpenAPIObject;
  hideBase?: boolean;
}

export function Field({ name, type, depth, spec, hideBase }: FieldProps): ReactNode {
  const config = useContext(ConfigContext)
  const { fieldDetails } = useContext(ExtensionsContext)
  const [underlyingShowed, setUnderlyingShowed] = useState(depth < config.defaultExpandedDepth);
  const hasUnderlying = (type.underlyingObject || type.underlyingObjects || type.enumDetails) !== undefined;

  const { component: ExtensionRow, disablePadding: extensionDisablePadding } = fieldDetails ? fieldDetails({ name, fullSpec: spec, schema: type.schema ?? {} }) : {};

  return (<>
    {!hideBase && <FieldBase
      setUnderlyingShowed={setUnderlyingShowed}
      underlyingShowed={underlyingShowed}
      hasUnderlying={hasUnderlying}
      name={name}
      type={type}
      depth={depth}
    />}
    {ExtensionRow && <tr>
      <td colSpan={2} className="py-1" style={extensionDisablePadding ? {} : {
        paddingLeft: `${depth}em`
      }}>
        <div className={extensionDisablePadding ? "" : "ml-[15px] pl-1"}>
          <ExtensionRow />
        </div>
      </td>
    </tr>}
    {underlyingShowed && hasUnderlying && (
      (type.underlyingObject || type.underlyingObjects) ?
        <FieldUnderlying
          type={type}
          depth={depth}
          spec={spec}
        /> : (type.enumDetails && <EnumDetails enumDetails={type.enumDetails} depth={depth} />))}
  </>)
}
