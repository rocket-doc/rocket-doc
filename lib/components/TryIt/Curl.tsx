import { Language } from "@/components/Code/CodeEditor";
import { CodeViewer } from "@/components/Code/Viewer";
import { useMemo } from "react";

type CurlRequestProps = {
  request: RequestInit;
  url: string;
}

export function CurlRequest({ request, url }: CurlRequestProps) {
  const headers = useMemo(() => (request.headers ?? {}) as Record<string, string>, [request.headers]);
  const curlLines = useMemo(() => {
    let lines = [];
    lines.push(`curl -X ${request.method} ${url}`);
    lines.push(...Object.entries(headers).map(([name, value]) => `-H "${name}: ${value}"`));
    if (request.body) {
      if (typeof request.body === "string") {
        lines.push(`-d '${request.body}'`);
      } else {
        lines.push(`-d '${JSON.stringify(request.body)}'`);
      }
    }
    return lines;
  }, [request, url]);
  return (<CodeViewer code={curlLines.join(" \\\n  ")} language={Language.BASH} />)
}
