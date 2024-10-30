import { Code } from "@/components/Code/Code";
import DeprecatedTooltip from "@/components/DeprecatedTooltip";
import { MarkdownWithUrl } from "@/components/MarkdownWithUrl";
import { ParsedType } from "@/lib/types";
import { IconMinus, IconPlus } from "@tabler/icons-react";
import { ReactNode } from "react";
import { ColoredType } from "../ColoredType";

type FieldBaseProps = {
  setUnderlyingShowed: (showed: boolean) => void;
  underlyingShowed: boolean;
  depth: number;
  hasUnderlying: boolean;
  name: string;
  type: ParsedType;
}

export function FieldBase({
  setUnderlyingShowed,
  underlyingShowed,
  depth,
  hasUnderlying,
  name,
  type,
}: FieldBaseProps): ReactNode {
  return (
    <tr onClick={() => setUnderlyingShowed(!underlyingShowed)} className={"border-b border-b-gray-300 " + (hasUnderlying ? "cursor-pointer " : "")}>
      <td className={`flex items-center flex-wrap`} style={{
        paddingLeft: `${depth}em`
      }} >
        <div className="flex items-start">
          <div className="flex items-center">
            {hasUnderlying ? (underlyingShowed ? <IconMinus size={15} /> : <IconPlus size={15} />) : <></>}
            <Code className={"p-0 my-0 pl-1 flex-grow "
              + (hasUnderlying ? "" : "ml-[15px] ")
              + (type.schema?.deprecated ? "opacity-60 line-through decoration-from-font " : "")}
            >{name}</Code>
            {type.schema?.deprecated && <DeprecatedTooltip />}
          </div>
          {type.schema?.description && <div className="ml-[15px] pl-2 self-center" style={{ flexShrink: 100 }} >
            <MarkdownWithUrl className="text-xs">{type.schema.description}</MarkdownWithUrl>
          </div>}
        </div>
      </td>
      <td className="">
        {type.underlyingObjects ?
          (type.isAllOf ? "all of..." : "one of...") :
          <ColoredType type={type.fullTypeString} rootType={type.rootType} />}
      </td>
    </tr>)
}
