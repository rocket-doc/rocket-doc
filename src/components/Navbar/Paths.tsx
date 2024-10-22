import { useContext } from "react";
import { SpecContext } from "../../lib/context";
import { ExtractOperations } from "../../lib/operations";
import { NavLink } from "react-router-dom";
import { Tooltip } from "@nextui-org/react";

export interface PathsProps {

}

export default function Paths() {
  const { spec } = useContext(SpecContext);
  if (!spec || !spec.paths) return null;

  return (
    <div>
      {ExtractOperations(spec.paths).map(operation => (
        <Tooltip
          key={operation.id}
          isDisabled={!operation.summary}
          content={operation.summary}
          placement="right"
          closeDelay={0}
          showArrow
        >
          <NavLink to={`/operations/${operation.method}/${encodeURIComponent(operation.path)}`} className={
            ({ isActive }) => isActive ?
              "flex text-white justify-between cursor-pointer px-2 bg-gray-700" :
              "flex text-white justify-between cursor-pointer px-2"
          }>
            <span className="whitespace-nowrap overflow-hidden text-ellipsis">{operation.path}</span>
            <span className={`whitespace-nowrap uppercase ml-2 httpmethod-${operation.method}`}>{operation.method}</span>
          </NavLink>
        </Tooltip>
      ))}
    </div>
  )
}
