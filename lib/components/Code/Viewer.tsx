import { IconCheck, IconCopy } from "@tabler/icons-react";
import { XMLBuilder, XMLParser } from "fast-xml-parser";
import * as PrismJS from "prismjs";
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-xml-doc';
import 'prismjs/components/prism-yaml';
import 'prismjs/themes/prism-tomorrow.css';
import { useCallback, useEffect, useRef, useState } from "react";
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import { langMap, Language } from "./CodeEditor";

type CodeViewerProps = {
  code: string;
  language?: Language;
}

export function CodeViewer({
  code,
  language = Language.JSON,
}: CodeViewerProps & React.HTMLAttributes<HTMLDivElement>) {
  const [codeFormatted, setCodeFormatted] = useState("");
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!codeRef.current) return;
    PrismJS.highlightElement(codeRef.current);
  }, [codeFormatted, codeRef]);

  useEffect(() => {
    try {
      switch (language) {
        case Language.JSON:
          setCodeFormatted(JSON.stringify(JSON.parse(code), null, 2));
          break;
        case Language.YAML:
          setCodeFormatted(stringifyYaml(parseYaml(code), { indent: 2 }));
          break;
        case Language.XML:
          setCodeFormatted((new XMLBuilder()).build((new XMLParser()).parse(code)));
          break;
        default:
          setCodeFormatted(code);
      }
    } catch (error) {
      setCodeFormatted(code);
    }
  }, [code]);

  return (<div className="relative">
    <Copy text={codeFormatted} />
    <pre className="relative">
      <code ref={codeRef}
        className={`language-${langMap[language]}`}
      >{codeFormatted}</code>
    </pre>
  </div>)
}

export function Copy({ text }: { text: string }) {
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    if (clicked) {
      setTimeout(() => setClicked(false), 1000);
    }
  }, [clicked]);

  const callback = useCallback(() => {
    setClicked(true);
    navigator.clipboard.writeText(text)
  }, [text])

  return (
    <div className="absolute top-0 right-0 mt-2 mr-2 cursor-pointer z-10 hover:opacity-50 transition-all" onClick={callback}>
      {clicked ? <IconCheck className="text-white" /> : <IconCopy className="text-white" />}
    </div>
  )
}
