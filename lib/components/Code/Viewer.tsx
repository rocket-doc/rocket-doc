import * as PrismJS from "prismjs";
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-xml-doc';
import 'prismjs/components/prism-yaml';
import 'prismjs/themes/prism-tomorrow.css';
import { useEffect, useRef, useState } from "react";
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
        default:
          setCodeFormatted(code);
      }
    } catch (error) {
      setCodeFormatted(code);
    }
  }, [code]);

  return (<pre>
    <code ref={codeRef}
      className={`language-${langMap[language]}`}
    >{codeFormatted}</code>
  </pre>)
}
