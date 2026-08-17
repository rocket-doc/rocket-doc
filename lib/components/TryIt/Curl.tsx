import { Language } from "@/components/Code/CodeEditor";
import { CodeViewer } from "@/components/Code/Viewer";
import { BuildCurlCommand } from "@/lib/curl";
import { useMemo } from "react";

type CurlRequestProps = {
  request: RequestInit;
  url: string;
}

export function CurlRequest({ request, url }: CurlRequestProps) {
  const command = useMemo(() => BuildCurlCommand({
    method: request.method,
    url,
    headers: (request.headers ?? {}) as Record<string, string>,
    body: typeof request.body === "string" ? request.body : null,
  }), [request, url]);

  return (<CodeViewer code={command} language={Language.BASH} />)
}
