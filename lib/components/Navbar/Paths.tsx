import DeprecatedTooltip from "@/components/DeprecatedTooltip";
import { SpecContext } from "@/lib/context";
import { ExtractOperations, Operation } from "@/lib/operations";
import { IconCaretDownFilled, IconCaretUpFilled, IconCommand } from "@tabler/icons-react";
import { Collapse, Input, Tooltip } from "antd";
import { useContext, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";

function OperationRow({ operation }: { operation: Operation }) {
  return (<Tooltip
    // isDisabled={!operation.summary}
    title={operation.summary ?? undefined}
    placement="right"
    showArrow
  >
    <NavLink to={`/operations/${operation.method}/${encodeURIComponent(operation.path)}`} className={
      ({ isActive }) => "w-full flex justify-start items-center text-white cursor-pointer transition-background "
        + (isActive ? "bg-gray-700 " : "hover:bg-gray-900 ")
        + (operation.deprecated ? "opacity-60" : "")
    }>
      <span className={`whitespace-nowrap uppercase ml-2 httpmethod-${operation.method}`}>{operation.method.slice(0, 3)}</span>
      <span className="whitespace-nowrap overflow-hidden text-ellipsis px-2">{operation.path}</span>
      {operation.deprecated && <DeprecatedTooltip />}
    </NavLink>
  </Tooltip>)
}

export default function Paths() {
  const { spec } = useContext(SpecContext);
  const [filter, setFilter] = useState<string>("");
  const [activeKeys, setActiveKeys] = useState<string[] | null>(null);

  const tagDescription = useMemo(() => {
    let tagMap = new Map<string, string>();
    spec?.tags?.forEach(tag => {
      tagMap.set(tag.name, tag.description ?? "");
    })
    return tagMap;
  }, [spec?.tags])

  const [operationsByTag, taglessOperations] = useMemo(() => {
    if (!spec?.paths) return [[], []];
    if (activeKeys === null) setActiveKeys(spec?.tags?.map(tag => tag.name) ?? [])
    const operations = ExtractOperations(spec.paths, filter);
    const operationsByTag = operations.filter(({ tag }) => tag !== "")
    const taglessOperations = operations.filter(({ tag }) => tag === "");
    if (taglessOperations.length > 0) {
      return [operationsByTag, taglessOperations[0].operations]
    } else return [operationsByTag, []]
  }, [spec?.paths, filter])

  if (!spec || !spec.paths) return null;
  return (
    <div className="flex flex-col" >
      <Input
        allowClear
        placeholder="Filter operations"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="mx-4 mb-2 w-auto"
        onClear={() => setFilter("")}
      />
      <small className="flex flex-row justify-center items-center w-full">
        <code className="bg-slate-300 text-gray-800 px-1 rounded-md flex items-center" ><IconCommand className="inline" size={20} />K</code><span className="ml-2">for the search prompt</span>
      </small>

      <div className="flex flex-row justify-end mr-2">
        <Tooltip className="cursor-pointer hover:opacity-70 transition-all" title="Expand all" placement="top">
          <IconCaretDownFilled onClick={() => setActiveKeys(operationsByTag.map(({ tag }) => tag))} />
        </Tooltip>
        <Tooltip className="cursor-pointer hover:opacity-70 transition-all" title="Collapse all" placement="top">
          <IconCaretUpFilled onClick={() => setActiveKeys([])} />
        </Tooltip>
      </div>

      {taglessOperations.length > 0 && taglessOperations.map(operation => (<OperationRow key={operation.path + "_" + operation.method} operation={operation} />))}
      <Collapse
        ghost
        activeKey={activeKeys ?? []}
        onChange={(keys) => setActiveKeys(keys)}
        items={operationsByTag.map(({ tag, operations }) => ({
          key: tag,
          label: <div className="flex flex-col">
            <span>{tag}</span>
            {tagDescription.get(tag) && <small className="text-gray-400">{tagDescription.get(tag)}</small>}
          </div>,
          children: operations.map(operation => <OperationRow key={operation.id} operation={operation} />),
          styles: {
            header: { color: "white", padding: "0.1rem 0.5rem", paddingLeft: "" },
          },
          classNames: {
            header: "capitalize"
          },
        }))}
      />

    </div>
  )
}
