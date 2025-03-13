import { Card, Select } from "antd";
import { OpenAPIObject } from "openapi3-ts/oas31";
import { useEffect, useMemo, useState } from "react";

export type ServerInformations = {
  baseUrl: string;
}

type TryItServerProps = {
  spec: OpenAPIObject | null;
  setServer: (auth: ServerInformations | null) => void;
}

export function TryIt_Server({ spec, setServer }: TryItServerProps) {
  const [serverValue, setServerValue] = useState<ServerInformations | null>(null);

  useEffect(() => {
    if (spec?.servers && spec?.servers.length > 0) setServerValue({ baseUrl: spec.servers[0].url ?? "" });
    else setServerValue({ baseUrl: window.location.origin });
  }, [spec, setServerValue]);

  const fullServerUrl = useMemo(() => {
    if (serverValue === null) return;

    let specUrl = serverValue.baseUrl;
    if (!specUrl.startsWith('http://') && !specUrl.startsWith('https://')) {
      if (!specUrl.startsWith('/')) specUrl = '/' + specUrl;
      specUrl = window.location.origin + specUrl;
    }
    return specUrl;
  }, [serverValue]);

  useEffect(() => {
    if (!fullServerUrl) return;
    setServer({
      baseUrl: fullServerUrl,
    });
  }, [fullServerUrl]);


  if (!spec?.servers || spec.servers.length === 0) return null;
  if (spec.servers.length === 1) return <small>Server URL: {fullServerUrl}</small>;
  return (
    <Card title="Server" className="" styles={{ body: { padding: "1rem", paddingTop: '0.5rem' } }}>
      <Select
        options={spec.servers.map((server, i) => ({
          label: (server.url + (server.description ? ` (${server.description})` : "")) || `Current server (${i})`,
          value: i,
        }))}
        defaultValue={0}
        onChange={(v) => setServerValue({
          baseUrl: spec.servers![v].url ?? ""
        })}
        className="mb-2"
      />
      <br /><small>Server URL: {fullServerUrl}</small>
    </Card>)
}
