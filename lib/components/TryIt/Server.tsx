import { Card, Input, Select } from "antd";
import { ServerObject } from "openapi3-ts/oas31";
import { useEffect, useMemo, useState } from "react";

export type ServerInformations = {
  baseUrl: string;
}

type TryItServerProps = {
  // Servers applying to the operation (operation, path item or spec level)
  servers?: ServerObject[];
  setServer: (server: ServerInformations | null) => void;
}

function defaultVariableValues(server: ServerObject | undefined): Record<string, string> {
  return Object.fromEntries(
    Object.entries(server?.variables ?? {}).map(([name, variable]) => [name, String(variable.default ?? "")])
  );
}

// Replaces the `{variable}` placeholders of a server URL and makes it absolute
function resolveServerUrl(url: string, variables: Record<string, string>): string {
  let resolved = url.replace(/\{([^}]+)\}/g, (match, name) => variables[name] ?? match);
  if (!/^https?:\/\//.test(resolved)) {
    if (!resolved.startsWith('/')) resolved = '/' + resolved;
    resolved = window.location.origin + resolved;
  }
  return resolved;
}

export function TryIt_Server({ servers, setServer }: TryItServerProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [variables, setVariables] = useState<Record<string, string>>({});

  const selectedServer = servers?.[selectedIndex];

  useEffect(() => {
    setSelectedIndex(0);
  }, [servers]);

  useEffect(() => {
    setVariables(defaultVariableValues(selectedServer));
  }, [selectedServer]);

  const fullServerUrl = useMemo(
    () => resolveServerUrl(selectedServer?.url ?? window.location.origin, variables),
    [selectedServer, variables]
  );

  useEffect(() => {
    setServer({ baseUrl: fullServerUrl });
  }, [fullServerUrl, setServer]);

  const variableEntries = Object.entries(selectedServer?.variables ?? {});
  if (!servers?.length) return null;
  if (servers.length === 1 && variableEntries.length === 0) return <small>Server URL: {fullServerUrl}</small>;

  return (
    <Card title="Server" styles={{ body: { padding: "1rem", paddingTop: '0.5rem' } }}>
      {servers.length > 1 && <Select
        options={servers.map((server, i) => ({
          label: (server.url + (server.description ? ` (${server.description})` : "")) || `Current server (${i})`,
          value: i,
        }))}
        value={selectedIndex}
        onChange={setSelectedIndex}
        className="mb-2 w-full"
      />}
      {variableEntries.map(([name, variable]) => (
        <div key={name} className="mb-2 flex items-center gap-2">
          <span className="text-sm font-mono">{name}</span>
          {variable.enum?.length
            ? <Select
              className="flex-1"
              options={variable.enum.map((value) => ({ label: value, value }))}
              value={variables[name] ?? ""}
              onChange={(value) => setVariables((previous) => ({ ...previous, [name]: value }))}
            />
            : <Input
              className="flex-1"
              value={variables[name] ?? ""}
              placeholder={variable.description ?? name}
              onChange={(e) => setVariables((previous) => ({ ...previous, [name]: e.target.value }))}
            />}
        </div>
      ))}
      <small>Server URL: {fullServerUrl}</small>
    </Card>)
}
