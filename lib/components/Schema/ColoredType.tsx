import { HTMLAttributes } from "react";

export type ColoredTypeProps = {
  type: string;
  rootType: string;
} & HTMLAttributes<HTMLSpanElement>;

export function ColoredType({ type, rootType, className, ...others }: ColoredTypeProps) {
  switch (rootType) {
    case "object":
    case "oneOf":
    case "allOf":
      return <span className={"italic text-blue-500 " + className} {...others}>{type}</span>;
    case "array":
      return <span className={"italic text-green-500 " + className} {...others}>{type}</span>;
    case "string":
      return <span className={"italic text-yellow-500 " + className} {...others}>{type}</span>;
    case "integer":
    case "number":
      return <span className={"italic text-red-400 " + className} {...others}>{type}</span>;
    case "boolean":
      return <span className={"italic text-purple-500 " + className} {...others}>{type}</span>;
    case "const":
    case "enum":
    case "any":
      return <span className={"italic " + className} {...others}>{type}</span >;
    default:
      return <span className={"italic text-gray-500 " + className} {...others}>{type}</span>;
  }
}
