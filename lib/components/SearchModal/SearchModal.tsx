import { ModalContext, SpecContext } from "@/lib/context";
import { ExtractOperations, Operation } from "@/lib/operations";
import { Input, InputRef, Modal } from "antd";
import { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function SearchModal() {
  const { spec } = useContext(SpecContext);
  const [isOpen, setIsOpen] = useState(false);
  const { isOpen: isGlobalModalOpen, setIsOpen: setIsGlobalModalOpen } = useContext(ModalContext);
  const navigate = useNavigate()

  const [results, setResults] = useState<Operation[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [indexSelected, setIndexSelected] = useState(0);

  const inputElement = useRef<InputRef>(null);
  const selectedResultElement = useRef<HTMLAnchorElement>(null);

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
      };
      if (isOpen && event.key === "Enter" && selectedResultElement.current) {
        selectedResultElement.current.click();
      } else if (isOpen && event.key === "ArrowDown") {
        setIndexSelected((index) => Math.min(index + 1, results.length - 1));
      } else if (isOpen && event.key === "ArrowUp") {
        setIndexSelected((index) => Math.max(index - 1, 0));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, results, indexSelected, navigate, isGlobalModalOpen]);

  useEffect(() => {
    if (!selectedResultElement.current) return;
    selectedResultElement.current.scrollIntoView({ block: "nearest" });

  }, [selectedResultElement, indexSelected]);

  useEffect(() => {
    setIsGlobalModalOpen(isOpen);
  }, [isOpen, setIsGlobalModalOpen]);

  useEffect(() => {
    if (!spec) return;
    if (!searchValue) setResults([]);

    setResults(ExtractOperations(spec.paths ?? {}, searchValue).map(({ operations }) => operations).flat());
  }, [searchValue, spec]);

  useEffect(() => {
    if (indexSelected > results.length - 1) {
      setIndexSelected(0);
    }
  }, [indexSelected, results]);

  return (
    <Modal afterOpenChange={() => { inputElement?.current?.focus(); inputElement?.current?.select(); }} open={isOpen} onCancel={() => setIsOpen(false)} cancelButtonProps={{ hidden: true }} okButtonProps={{ hidden: true }}>
      <div className="pt-3">
        <Input
          className="mt-3 w-full"
          ref={inputElement}
          placeholder="Search a route by path or tag"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          allowClear
          onClear={() => setSearchValue("")}
        />
        <div className="max-h-[30vh] overflow-y-auto mt-3">
          {/* Search results */}
          {results.map(({ path, method }, i) => (
            <Link
              key={`${method}-${path}`}
              to={`/operations/${method}/${encodeURIComponent(path)}`}
              className={"block p-2 dark:hover:text-gray-400" + (i === indexSelected ? " bg-gray-300 dark:bg-gray-700" : "")}
              onClick={() => setIsOpen(false)}
              ref={i === indexSelected ? selectedResultElement : null}
            >
              <span className="uppercase">{method}</span> {path}
            </Link>
          ))}
        </div>
      </div>
    </Modal>
  );
}
