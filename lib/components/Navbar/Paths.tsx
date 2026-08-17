import DeprecatedTooltip from "@/components/DeprecatedTooltip";
import { MethodBadge } from "@/components/MethodBadge";
import { SpecContext } from "@/lib/context";
import {
  ExtractOperations,
  ExtractWebhooks,
  Operation,
  OperationRoute,
  OperationsByTag,
  taglessTag,
} from "@/lib/operations";
import { IconCaretDownFilled, IconCaretUpFilled, IconCommand } from "@tabler/icons-react";
import { Collapse, Empty, Input, Tooltip } from "antd";
import { useContext, useEffect, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

function OperationRow({ operation }: { operation: Operation }) {
  return (<Tooltip
    title={operation.summary ?? undefined}
    placement="right"
    showArrow
  >
    <NavLink to={OperationRoute(operation)} className={
      ({ isActive }) => "w-full flex justify-start items-center gap-2 px-2 py-0.5 cursor-pointer rd-sidebar-item "
        + (isActive ? "rd-sidebar-item-active " : "")
        + (operation.deprecated ? "opacity-60" : "")
    }>
      <MethodBadge method={operation.method} short />
      <span className="whitespace-nowrap overflow-hidden text-ellipsis text-sm">{operation.path}</span>
      {operation.deprecated && <DeprecatedTooltip />}
    </NavLink>
  </Tooltip>)
}

// Collapse keys are prefixed to stay unique between the operations & webhooks sections
function collapseKey(prefix: string, tag: string): string {
  return `${prefix}:${tag}`;
}

function allCollapseKeys(prefix: string, operationsByTag: OperationsByTag): string[] {
  return operationsByTag.filter(({ tag }) => tag !== taglessTag).map(({ tag }) => collapseKey(prefix, tag));
}

type TagSectionProps = {
  prefix: string;
  operationsByTag: OperationsByTag;
  tagDescriptions: Map<string, string>;
  activeKeys: string[];
  setActiveKeys: (keys: string[]) => void;
}

function TagSection({ prefix, operationsByTag, tagDescriptions, activeKeys, setActiveKeys }: TagSectionProps) {
  const tagless = operationsByTag.find(({ tag }) => tag === taglessTag)?.operations ?? [];
  const tagged = operationsByTag.filter(({ tag }) => tag !== taglessTag);

  return (<>
    {tagless.map((operation) => <OperationRow key={operation.id} operation={operation} />)}
    <Collapse
      ghost
      activeKey={activeKeys}
      onChange={(keys) => setActiveKeys(typeof keys === "string" ? [keys] : keys)}
      items={tagged.map(({ tag, operations }) => ({
        key: collapseKey(prefix, tag),
        label: <div className="flex flex-col">
          <span className="text-sm font-medium">{tag}</span>
          {tagDescriptions.get(tag) && <small className="opacity-60 line-clamp-2">{tagDescriptions.get(tag)}</small>}
        </div>,
        children: operations.map((operation) => <OperationRow key={operation.id} operation={operation} />),
        styles: {
          header: { color: "var(--rd-sidebar-fg)", padding: "0.1rem 0.5rem" },
          body: { padding: 0 },
        },
        classNames: {
          header: "capitalize",
        },
      }))}
    />
  </>)
}

export default function Paths() {
  const { spec } = useContext(SpecContext);
  const { pathname } = useLocation();
  const [filter, setFilter] = useState<string>("");
  // `null` means "not customized yet", every tag is then expanded
  const [activeKeys, setActiveKeys] = useState<string[] | null>(null);

  const tagDescriptions = useMemo(
    () => new Map((spec?.tags ?? []).map((tag) => [tag.name, tag.description ?? ""])),
    [spec?.tags]
  );

  const operations = useMemo(() => ExtractOperations(spec, filter), [spec, filter]);
  const webhooks = useMemo(() => ExtractWebhooks(spec, filter), [spec, filter]);

  const everyKey = useMemo(
    () => [...allCollapseKeys("paths", operations), ...allCollapseKeys("webhooks", webhooks)],
    [operations, webhooks]
  );
  const effectiveKeys = activeKeys ?? everyKey;

  // Expands the tags containing the operation of the current route, so that
  // jumping to an operation (eg. from the search modal) reveals it in the navbar
  useEffect(() => {
    const activeTags = [
      ...operations.map((group) => ({ prefix: "paths", ...group })),
      ...webhooks.map((group) => ({ prefix: "webhooks", ...group })),
    ]
      .filter(({ operations }) => operations.some((operation) => OperationRoute(operation) === pathname))
      .map(({ prefix, tag }) => collapseKey(prefix, tag));

    if (activeTags.length === 0) return;
    setActiveKeys((keys) => (keys === null ? null : Array.from(new Set([...keys, ...activeTags]))));
  }, [pathname, operations, webhooks]);

  if (!spec) return null;
  return (
    <div className="flex flex-col pb-4">
      <div className="sticky top-0 z-10 rd-sidebar py-2 px-2 w-full flex flex-col justify-center items-center gap-1 border-b" style={{ borderColor: "var(--rd-sidebar-border)" }}>
        <Input
          allowClear
          placeholder="Filter operations"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full"
          onClear={() => setFilter("")}
        />
        <div className="flex w-full items-center justify-between">
          <small className="flex items-center opacity-70">
            <code className="bg-slate-300 text-gray-800 px-1 rounded-md flex items-center"><IconCommand className="inline" size={16} />K</code>
            <span className="ml-1">to search</span>
          </small>
          <div className="flex flex-row gap-1">
            <Tooltip className="cursor-pointer hover:opacity-70 transition-all" title="Expand all" placement="top">
              <IconCaretDownFilled size={18} onClick={() => setActiveKeys(everyKey)} />
            </Tooltip>
            <Tooltip className="cursor-pointer hover:opacity-70 transition-all" title="Collapse all" placement="top">
              <IconCaretUpFilled size={18} onClick={() => setActiveKeys([])} />
            </Tooltip>
          </div>
        </div>
      </div>
      {operations.length === 0 && webhooks.length === 0 && (
        <Empty className="mt-4" description={<span className="opacity-70">No operation found</span>} />
      )}
      <TagSection
        prefix="paths"
        operationsByTag={operations}
        tagDescriptions={tagDescriptions}
        activeKeys={effectiveKeys}
        setActiveKeys={setActiveKeys}
      />
      {webhooks.length > 0 && <>
        <div className="px-2 pt-3 pb-1 text-xs uppercase tracking-wide opacity-60">Webhooks</div>
        <TagSection
          prefix="webhooks"
          operationsByTag={webhooks}
          tagDescriptions={tagDescriptions}
          activeKeys={effectiveKeys}
          setActiveKeys={setActiveKeys}
        />
      </>}
    </div>
  )
}
