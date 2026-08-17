import { CodeViewer } from "@/components/Code/Viewer";
import { AuthInformations } from "@/components/SecurityRequirement/schemes";
import { MediaTypeToLanguage } from "@/lib/media_type";
import { Operation } from "@/lib/operations";
import { IconRocket } from "@tabler/icons-react";
import { Alert, Button, Card, Collapse, Spin, Tag } from "antd";
import { OpenAPIObject } from "openapi3-ts/oas31";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TryIt_Auth } from "./Auth";
import { RequestBody, TryIt_Body } from "./Body";
import { CurlRequest } from "./Curl";
import { RequestParam, TryIt_Parameters } from "./Parameters";
import { ServerInformations, TryIt_Server } from "./Server";

function statusColor(status: number): string {
  if (status < 200) return "blue";
  if (status < 300) return "green";
  if (status < 400) return "cyan";
  if (status < 500) return "orange";
  return "red";
}

type TryItProps = {
  operation: Operation;
  spec: OpenAPIObject | null;
}

export function TryIt({ operation, spec }: TryItProps) {
  const [body, setBody] = useState<RequestBody | null>(null);
  const [parameters, setParameters] = useState<RequestParam[]>([]);
  const [auth, setAuth] = useState<AuthInformations | null>(null);
  const [server, setServer] = useState<ServerInformations | null>(null);

  const [headers, setHeaders] = useState<Record<string, string>>({});
  const [query, setQuery] = useState<string>("");

  const [response, setResponse] = useState<Response | null>(null);
  const [responseError, setResponseError] = useState<Error | null>(null);
  const [responsePending, setResponsePending] = useState<boolean>(false);
  const [responseText, setResponseText] = useState<string | null>(null);
  const [responseTextPending, setResponseTextPending] = useState<boolean>(false);
  const [elapsedTime, setElapsedTime] = useState<number | null>(null);

  const responseCard = useRef<HTMLDivElement>(null);
  useEffect(() => {
    responseCard.current?.scrollIntoView({ behavior: "smooth" });
  }, [response]);

  useEffect(() => {
    setResponse(null);
    setResponseError(null);
    setResponsePending(false);
    setResponseText(null);
    setResponseTextPending(false);
    setElapsedTime(null);
  }, [operation, spec]);

  // Handle headers
  useEffect(() => {
    const newHeaders: Record<string, string> = {};
    if (body && body.mediaType !== "") {
      newHeaders["Content-Type"] = body.mediaType;
    }

    parameters.filter((p) => p.location === "header" && p.value !== "").forEach((p) => {
      newHeaders[p.name] = p.value;
    });

    Object.entries(auth?.headers ?? {}).forEach(([name, value]) => {
      newHeaders[name] = value as string;
    });

    setHeaders(newHeaders)
  }, [body, parameters, auth]);

  // Handle query
  useEffect(() => {
    const newQueryParams = new URLSearchParams();
    parameters.filter((p) => p.location === "query" && p.value !== "").forEach((p) => {
      newQueryParams.set(p.name, p.value);
    });
    Object.entries(auth?.query ?? {}).forEach(([name, value]) => {
      newQueryParams.set(name, value as string);
    });
    setQuery(newQueryParams.toString());
  }, [parameters, auth]);

  const fetchRequest = useMemo<RequestInit>(() => ({
    method: operation.method.toUpperCase(),
    headers: headers,
    body: body?.body,
  }), [operation, headers, body]);

  const fetchUrl = useMemo(() => {
    const baseUrl = server?.baseUrl?.replace(/\/$/, '') || '';
    const path = operation.path.startsWith('/') ? operation.path : `/${operation.path}`;
    let url = `${baseUrl}${path}`;
    const variables = Object.fromEntries(parameters.filter((p) => p.location === "path" && p.value !== "").map((p) => ([p.name, p.value])));
    url = url.replace(/\{([^}]+)\}/g, (_, name) => variables[name] ?? "");

    return `${url}${query ? `?${query}` : ""}`
  }, [server, operation, query, parameters]);

  const run = useCallback(async () => {
    if (!server) {
      return;
    }

    const startTime = performance.now();
    setResponsePending(true);
    setResponseText(null);
    try {
      const response = await fetch(fetchUrl, fetchRequest);
      setElapsedTime(performance.now() - startTime);
      setResponse(response);
      setResponseError(null);
      setResponseTextPending(true);
      try {
        setResponseText(await response.text());
      } finally {
        setResponseTextPending(false);
      }
    } catch (e) {
      setResponse(null);
      setResponseError(e instanceof Error ? e : new Error(String(e) || "Unknown error"));
      setResponseText(null);
      setResponseTextPending(false);
      setElapsedTime(null);
    } finally {
      setResponsePending(false);
    }
  }, [server, fetchRequest, fetchUrl]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'Enter' && !responsePending) {
        e.preventDefault();
        run();
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    // Clean up the event listener when component unmounts
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [run, responsePending]); // Include run and responsePending in dependencies

  return (
    <div className="flex flex-col gap-2">
      <TryIt_Server servers={operation.servers} setServer={setServer} />
      <TryIt_Auth operation={operation} spec={spec} setAuth={setAuth} />
      <TryIt_Parameters
        operation={operation}
        spec={spec}
        setParams={setParameters}
      />
      <TryIt_Body
        operation={operation}
        spec={spec}
        setBody={setBody}
      />
      <Collapse
        items={[{
          label: "Curl request",
          key: "curl",
          children: (<CurlRequest request={fetchRequest} url={fetchUrl} />)
        }]}
      />
      <Button className="mx-auto p-5" onClick={run} disabled={responsePending}><IconRocket /> Run request</Button>
      {(response || responsePending || responseError) && <Card title="Response" ref={responseCard}>
        {responsePending && <div> <Spin /> Waiting for response...</div>}
        {response && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Tag color={statusColor(response.status)} className="m-0 font-mono">{response.status} {response.statusText}</Tag>
              {elapsedTime !== null && <span className="text-xs opacity-60">{elapsedTime.toFixed(0)} ms</span>}
            </div>
            <Collapse
              items={[{
                label: "Headers",
                key: "headers",
                children: (<>
                  {Array.from(response.headers.entries()).map(([name, value]) => (
                    <div key={name}><b>{name}:</b> {value}</div>
                  ))}
                </>)
              }]}
            />
            {responseTextPending && <div><Spin /> Loading body...</div>}
            {responseText && <CodeViewer code={responseText} language={MediaTypeToLanguage(response.headers.get("content-type"))} />}
          </div>
        )}
        {responseError && (
          <Alert type="error" showIcon message="Request failed" description={responseError.message} />
        )}
      </Card>}
    </div>
  )
}
