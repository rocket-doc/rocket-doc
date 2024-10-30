import { Card, Select } from "antd";
import { OpenAPIObject } from "openapi3-ts/oas31";
import { useEffect, useState } from "react";

export type ServerInformations = {
  basePath: string;
}

type TryItServerProps = {
  spec: OpenAPIObject | null;
  setServer: (auth: ServerInformations | null) => void;
}

export function TryIt_Server({ spec, setServer }: TryItServerProps) {
  const [serverValue, setServerValue] = useState<ServerInformations>({ basePath: "" });

  useEffect(() => {
    setServer(serverValue);
  }, [serverValue]);

  useEffect(() => {
    if (!spec?.servers || spec.servers.length === 0) setServerValue({ basePath: "" });
    else setServerValue({
      basePath: spec.servers[0].url
    });
  }, [spec]);

  if (!spec?.servers || spec.servers.length === 0) return null;
  if (spec.servers.length === 1) return <small>Server URL: {spec.servers[0].url}</small>;
  return (
    <Card title="Server" className="" styles={{ body: { padding: "1rem", paddingTop: '0.5rem' } }}>
      <Select
        options={spec.servers.map((server, i) => ({
          label: (server.url + (server.description ? ` (${server.description})` : "")) || `Current server (${i})`,
          value: i,
        }))}
        defaultValue={0}
        onChange={(v) => setServerValue({
          basePath: spec.servers![v].url ?? ""
        })}
        className="mb-2"
      />
      <br /><small>Server URL: {serverValue.basePath}</small>
    </Card>)
}
