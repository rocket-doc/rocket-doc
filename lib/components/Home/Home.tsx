import { securityRoute } from "@/components/Security/Security";
import { SpecContext } from "@/lib/context";
import { ExtractOperations, ExtractWebhooks, FlattenOperations } from "@/lib/operations";
import { IconExternalLink, IconKey } from "@tabler/icons-react";
import { Card, Divider, Statistic, Tag, Typography } from "antd";
import { InfoObject } from "openapi3-ts/oas31";
import { useContext, useMemo } from "react";
import { Link } from "react-router-dom";
import { MarkdownWithUrl } from "../MarkdownWithUrl";

export function Home() {
  const { spec } = useContext(SpecContext);

  const stats = useMemo(() => ({
    operations: FlattenOperations(ExtractOperations(spec)).length,
    webhooks: FlattenOperations(ExtractWebhooks(spec)).length,
    schemas: Object.keys(spec?.components?.schemas ?? {}).length,
  }), [spec]);

  if (!spec) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Welcome to Rocket Doc!</h1>
          <p className="opacity-70">Load an OpenAPI 3.1 specification to get started</p>
        </div>
      </div>);
  }

  const { info, externalDocs, servers } = spec;
  // `info.summary` was added by OpenAPI 3.1 and is missing from the typings
  const summary = (info as InfoObject & { summary?: string } | undefined)?.summary;
  return (
    <div className="m-2 max-w-4xl flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline gap-2">
        <h1 className="text-3xl font-bold m-0">{info?.title ?? "Home"}</h1>
        {info?.version && <Tag color="blue">v{info.version}</Tag>}
        {spec.openapi && <Tag>OpenAPI {spec.openapi}</Tag>}
      </div>
      <div className="flex flex-wrap gap-4 text-sm">
        {info?.license?.name && (
          <span>
            License:{" "}
            {info.license.url
              ? <a href={info.license.url} target="_blank" rel="noreferrer">{info.license.name}</a>
              : info.license.name}
          </span>
        )}
        {info?.contact?.email && <span>Contact: <a href={`mailto:${info.contact.email}`}>{info.contact.name ?? info.contact.email}</a></span>}
        {info?.contact?.url && <a href={info.contact.url} target="_blank" rel="noreferrer">{info.contact.name ?? info.contact.url}</a>}
        {info?.termsOfService && <a href={info.termsOfService} target="_blank" rel="noreferrer">Terms of service</a>}
        {externalDocs?.url && (
          <a href={externalDocs.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1">
            {externalDocs.description ?? "External documentation"}<IconExternalLink size={14} />
          </a>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Card size="small" className="min-w-32"><Statistic title="Operations" value={stats.operations} /></Card>
        {stats.webhooks > 0 && <Card size="small" className="min-w-32"><Statistic title="Webhooks" value={stats.webhooks} /></Card>}
        <Card size="small" className="min-w-32"><Statistic title="Schemas" value={stats.schemas} /></Card>
        <Link to={securityRoute} className="min-w-32">
          <Card size="small" className="h-full hover:opacity-80 transition-opacity">
            <div className="flex items-center gap-2"><IconKey size={18} /> Security keys</div>
            <small className="opacity-70">Manage stored credentials</small>
          </Card>
        </Link>
      </div>

      {servers && servers.length > 0 && <div>
        <h2 className="text-lg font-semibold">Servers</h2>
        <ul className="list-disc pl-5">
          {servers.map((server) => (
            <li key={server.url}>
              <Typography.Text code copyable>{server.url}</Typography.Text>
              {server.description && <span className="opacity-70 ml-1">{server.description}</span>}
            </li>
          ))}
        </ul>
      </div>}

      {summary && <p className="text-base opacity-80">{summary}</p>}
      {info?.description && <>
        <Divider className="my-1" />
        <MarkdownWithUrl>{info.description}</MarkdownWithUrl>
      </>}
    </div >
  )
}
