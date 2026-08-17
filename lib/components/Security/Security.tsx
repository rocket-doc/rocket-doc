import { Error } from "@/components/Error/Error";
import { HiddenInput } from "@/components/SecurityRequirement/HiddenInput";
import { Profiles } from "@/components/SecurityRequirement/Profiles";
import { addValueToSavedCreds, getSavedCredential, schemeToCredentialType } from "@/components/SecurityRequirement/schemes";
import { SpecContext } from "@/lib/context";
import { useCredentialProfiles } from "@/lib/hooks/credentials";
import { ResolveSecuritySchemes } from "@/lib/security";
import { Alert, Table, Tag, Typography } from "antd";
import { SecuritySchemeObject } from "openapi3-ts/oas31";
import { useContext, useMemo } from "react";
import { MarkdownWithUrl } from "../MarkdownWithUrl";

export const securityRoute = "/security";

type SchemeRow = { key: string; name: string; scheme: SecuritySchemeObject };

function schemeDescription(scheme: SecuritySchemeObject): string {
  switch (scheme.type) {
    case "apiKey":
      return `API key in ${scheme.in} (${scheme.name})`;
    case "http":
      return `HTTP ${scheme.scheme}${scheme.bearerFormat ? ` (${scheme.bearerFormat})` : ""}`;
    case "oauth2":
      return `OAuth 2.0 (${Object.keys(scheme.flows ?? {}).join(", ")})`;
    case "openIdConnect":
      return `OpenID Connect (${scheme.openIdConnectUrl ?? ""})`;
    default:
      return scheme.type ?? "";
  }
}

// Security keys management, credentials are shared with the "Try it" tab through the credential profiles
export function Security() {
  const { spec } = useContext(SpecContext);
  const credentials = useCredentialProfiles();
  const { savedCreds, setSavedCreds } = credentials;

  const schemes = useMemo(() => ResolveSecuritySchemes(spec), [spec]);
  const rows = useMemo<SchemeRow[]>(
    () => Object.entries(schemes).map(([name, scheme]) => ({ key: name, name, scheme })),
    [schemes]
  );

  if (!spec) return <Error title="Spec not loaded yet" />;

  return (
    <div className="m-2 max-w-3xl">
      <h1 className="text-2xl font-semibold">Security keys</h1>
      <p className="opacity-70">
        Keys are stored in this browser only and are reused by the "Try it" tab of every operation.
      </p>
      <Profiles credentials={credentials} />
      {rows.length === 0
        ? <Alert type="info" showIcon message="This specification does not declare any security scheme." />
        : <Table<SchemeRow>
          pagination={false}
          dataSource={rows}
          rootClassName="overflow-x-auto"
          size="small"
          columns={[
            {
              key: "scheme",
              title: "Scheme",
              render: (_, { name, scheme }) => (<>
                <Typography.Text code>{name}</Typography.Text>
                <div><small className="opacity-70">{schemeDescription(scheme)}</small></div>
                {scheme.description && <small className="opacity-70"><MarkdownWithUrl>{scheme.description}</MarkdownWithUrl></small>}
              </>),
            },
            {
              key: "value",
              title: "Value",
              render: (_, { name, scheme }) => schemeToCredentialType(scheme)
                ? <HiddenInput
                  placeholder={scheme.name ?? name}
                  value={getSavedCredential(name, scheme, savedCreds)}
                  onChange={(e) => setSavedCreds(addValueToSavedCreds(name, scheme, e.target.value, savedCreds))}
                />
                : <Tag color="orange">Not supported yet</Tag>,
            },
          ]}
        />}
    </div>
  )
}
