import { MethodBadge } from "@/components/MethodBadge";
import { ModalContext, SpecContext } from "@/lib/context";
import { ExtractOperations, ExtractWebhooks, FlattenOperations, Operation, OperationRoute } from "@/lib/operations";
import { Empty, Input, InputRef, Modal, Tag } from "antd";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

const maxResults = 50;

export default function SearchModal() {
  const { spec } = useContext(SpecContext);
  const [isOpen, setIsOpen] = useState(false);
  const { isOpen: isGlobalModalOpen, setIsOpen: setIsGlobalModalOpen } = useContext(ModalContext);

  const [searchValue, setSearchValue] = useState("");
  const [indexSelected, setIndexSelected] = useState(0);

  const inputElement = useRef<InputRef>(null);
  const selectedResultElement = useRef<HTMLAnchorElement>(null);

  const results = useMemo<Operation[]>(() => {
    if (!spec || !searchValue) return [];
    return [
      ...FlattenOperations(ExtractOperations(spec, searchValue)),
      ...FlattenOperations(ExtractWebhooks(spec, searchValue)),
    ].slice(0, maxResults);
  }, [searchValue, spec]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        !isGlobalModalOpen &&
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "k"
      ) {
        event.preventDefault();
        setIsOpen(true);
        return;
      }
      if (!isOpen) return;
      if (event.key === "Enter" && selectedResultElement.current) {
        selectedResultElement.current.click();
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        setIndexSelected((index) => Math.min(index + 1, results.length - 1));
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setIndexSelected((index) => Math.max(index - 1, 0));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, results, isGlobalModalOpen]);

  useEffect(() => {
    selectedResultElement.current?.scrollIntoView({ block: "nearest" });
  }, [indexSelected, results]);

  useEffect(() => {
    setIsGlobalModalOpen(isOpen);
  }, [isOpen, setIsGlobalModalOpen]);

  useEffect(() => {
    setIndexSelected(0);
  }, [results]);

  return (
    <Modal
      afterOpenChange={() => { inputElement?.current?.focus(); inputElement?.current?.select(); }}
      open={isOpen}
      onCancel={() => setIsOpen(false)}
      cancelButtonProps={{ hidden: true }}
      okButtonProps={{ hidden: true }}
    >
      <div className="pt-3">
        <Input
          className="mt-3 w-full"
          ref={inputElement}
          placeholder="Search by path, method, summary, operation id or tag"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          allowClear
          onClear={() => setSearchValue("")}
        />
        <div className="max-h-[40vh] overflow-y-auto mt-3 rd-scroll">
          {searchValue && results.length === 0 && <Empty description="No operation found" />}
          {results.map((operation, i) => (
            <Link
              key={operation.id}
              to={OperationRoute(operation)}
              className={"flex flex-col gap-0.5 p-2 rounded-md dark:hover:text-gray-400" + (i === indexSelected ? " bg-gray-200 dark:bg-gray-700" : "")}
              onClick={() => setIsOpen(false)}
              ref={i === indexSelected ? selectedResultElement : null}
              onMouseEnter={() => setIndexSelected(i)}
            >
              <span className="flex items-center gap-2">
                <MethodBadge method={operation.method} />
                <span className="font-mono text-sm break-all">{operation.path}</span>
                {operation.kind === "webhook" && <Tag color="geekblue" className="m-0">webhook</Tag>}
              </span>
              {operation.summary && <small className="opacity-70 pl-1">{operation.summary}</small>}
            </Link>
          ))}
        </div>
      </div>
    </Modal>
  );
}
