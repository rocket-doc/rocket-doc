import { CodeViewer } from "@/components/Code/Viewer";
import { AuthInformations } from "@/components/SecurityRequirement/schemes";
import { Operation } from "@/lib/operations";
import { Button, Card, Collapse, Spin } from "antd";
import { OpenAPIObject } from "openapi3-ts/oas31";
import { useCallback, useEffect, useState } from "react";
import { TryIt_Auth } from "./Auth";
import { mediaTypeToLanguage, RequestBody, TryIt_Body } from "./Body";
import { RequestParam, TryIt_Parameters } from "./Parameters";
import { ServerInformations, TryIt_Server } from "./Server";

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

  useEffect(() => {
    setResponse(null);
    setResponseError(null);
    setResponsePending(false);
    setResponseText(null);
    setResponseTextPending(false);
  }, [operation, spec]);

  // Handle headers
  useEffect(() => {
    let newHeaders: Record<string, string> = {};
    if (body) {
      newHeaders["Content-Type"] = body.mediaType;
    }

    parameters.filter((p) => p.location === "header" && p.value !== "").forEach((p) => {
      newHeaders[p.name] = p.value;
    });

    auth?.headers && Object.entries(auth.headers).forEach(([name, value]) => {
      newHeaders[name] = value as string;
    });

    setHeaders(newHeaders)
  }, [body, parameters, auth]);

  // Handle query
  useEffect(() => {
    let newQueryParams = new URLSearchParams();
    parameters.filter((p) => p.location === "query" && p.value !== "").forEach((p) => {
      newQueryParams.set(p.name, p.value);
    });
    auth?.query && Object.entries(auth.query).forEach(([name, value]) => {
      newQueryParams.set(name, value as string);
    });
    setQuery(newQueryParams.toString());
  }, [parameters]);

  const run = useCallback(() => {
    if (!server) {
      return;
    }

    setResponsePending(true);
    fetch(`${server.basePath}${operation.path}${query ? `?${query}` : ""}`, {
      method: operation.method.toUpperCase(),
      headers: headers,
      body: undefined, //TODO: body ? body.body : undefined
    }).catch((e) => {
      setResponse(null);
      setResponseError(e ? new Error(e.toString()) : new Error("Unknown error"))
      setResponseText(null);
      setResponseTextPending(false)
    }).then((r) => {
      setResponse(r ?? null)
      setResponseError(null);
      setResponseText(null);
      if (r) {
        setResponseTextPending(true);
        r.text().then((t) => setResponseText(t)).finally(() => setResponseTextPending(false));
      }
    }).finally(() => setResponsePending(false));
  }, [operation, server, headers, query, body]);

  return (
    <div className="flex flex-col gap-2">
      <TryIt_Server spec={spec} setServer={setServer} />
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
      {(response || responsePending) && <Card title="Response">
        {responsePending && <div> <Spin /> Waiting for response...</div>}
        {response && (
          <div>
            <p>Status Code : {response.status}</p>
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
            {responseText && <CodeViewer code={responseText} language={mediaTypeToLanguage(response.headers.get("content-type"))} />}
          </div>
        )}
        {responseError && (
          <div>
            <h2>Error</h2>
            <pre>{responseError.message}</pre>
          </div>
        )}
      </Card>}
      <Button onClick={run}>Run</Button>
    </div>
  )
}
