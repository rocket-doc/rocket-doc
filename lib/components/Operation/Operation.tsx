import DeprecatedTooltip from "@/components/DeprecatedTooltip";
import { Error } from "@/components/Error/Error";
import { MethodBadge } from "@/components/MethodBadge";
import { Parameters } from "@/components/Parameters/Parameters";
import { ResponseHeaders } from "@/components/Operation/ResponseHeaders";
import { Schema } from "@/components/Schema/Schema";
import { TryIt } from "@/components/TryIt/TryIt";
import { SpecContext } from "@/lib/context";
import { useOperationFromRouter } from "@/lib/hooks/router";
import { HttpMethod, Operation as OperationType, OperationKind } from "@/lib/operations";
import { GetRef } from "@/lib/ref";
import { IconExternalLink } from "@tabler/icons-react";
import { Alert, Tabs, Tag, Tooltip, Typography } from 'antd';
import { MediaTypeObject, OpenAPIObject, ResponseObject } from "openapi3-ts/oas31";
import { useContext, useMemo } from "react";
import { MarkdownWithUrl } from "../MarkdownWithUrl";

export type OperationURLParams = {
  method: HttpMethod;
  path: string;
}

type OperationProps = {
  kind?: OperationKind;
}

export function Operation({ kind = "path" }: OperationProps) {
  const { spec } = useContext(SpecContext);
  const operation = useOperationFromRouter(kind);

  if (!spec) return <Error title="Spec not loaded yet" />;
  if (!operation) return <Error title={`${kind === "webhook" ? "Webhook" : "Operation"} not found in current spec`} />;

  return (
    <div className="m-2 max-w-5xl">
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <MethodBadge method={operation.method} className="!text-sm" />
          <h1 className="text-2xl font-semibold break-all font-mono m-0">{operation.path}</h1>
          {operation.kind === "webhook" && <Tag color="geekblue">Webhook</Tag>}
          {operation.deprecated && <Tag color="red" className="flex items-center gap-1">Deprecated<DeprecatedTooltip /></Tag>}
        </div>
        {operation.summary && <h2 className="text-lg font-normal opacity-80 m-0">{operation.summary}</h2>}
        <div className="flex flex-wrap items-center gap-2">
          {operation.operationId && <Typography.Text code copyable className="text-xs">{operation.operationId}</Typography.Text>}
          {operation.tags?.map((tag) => <Tag key={tag} className="m-0">{tag}</Tag>)}
          {operation.externalDocs?.url && (
            <a href={operation.externalDocs.url} target="_blank" rel="noreferrer" className="text-xs inline-flex items-center gap-1">
              {operation.externalDocs.description ?? "External documentation"}<IconExternalLink size={14} />
            </a>
          )}
        </div>
      </div>
      <Tabs
        items={[
          {
            label: <span>Description</span>,
            key: "description",
            children: <OperationSchema operation={operation} spec={spec} />,
          },
          {
            label: <span>Try it!</span>,
            key: "tryit", children: <TryIt
              operation={operation}
              spec={spec}
            />
          },
        ]} />
    </div>
  )
}

type OperationSchemaProps = {
  operation: OperationType;
  spec: OpenAPIObject;
}

function OperationSchema({ operation, spec }: OperationSchemaProps) {
  const bodyObj = useMemo(() => GetRef(operation.requestBody, spec)[0], [operation, spec]);
  const responses = useMemo(
    () => Object.entries(operation.responses ?? {}).map(
      ([status, response]) => [status, GetRef<ResponseObject>(response, spec)[0]] as const
    ),
    [operation, spec]
  );

  return (<>
    {operation.kind === "webhook" && <Alert
      className="my-2"
      type="info"
      showIcon
      message="This operation is a webhook: the request is sent by the API to a consumer provided URL."
    />}
    {
      operation.description && <>
        <h2 className="text-2xl">Description</h2>
        <MarkdownWithUrl className="m-2 mr-0">{operation.description}</MarkdownWithUrl>
      </>
    }
    {
      operation.parameters?.length ? <>
        <h2 className="text-2xl">Parameters</h2>
        <Parameters parameters={operation.parameters} />
      </> : null
    }
    {
      bodyObj && <>
        <h2 className="text-2xl">
          Request Body
          {bodyObj.required && <Tooltip title="Required"><span className="text-red-500 ml-1">*</span></Tooltip>}
        </h2>
        {bodyObj.description && <MarkdownWithUrl className="m-2 mr-0">{bodyObj.description}</MarkdownWithUrl>}
        <Tabs items={
          Object.entries(bodyObj.content ?? {}).map(([mediaType, mediaObj]) => {
            return { key: mediaType, label: mediaType, children: <Schema schema={mediaObj.schema} spec={spec} /> }
          })
        } />
      </>
    }
    {
      responses.length > 0 && <>
        <h2 className="text-2xl">Responses</h2>
        <small className="text-s">Status</small>
        <Tabs
          tabBarStyle={{ marginBottom: 0 }}
          items={responses.map(([status, response]) => ({
            key: status,
            label: status,
            children: (<>
              {response.description && <MarkdownWithUrl>{response.description}</MarkdownWithUrl>}
              <ResponseHeaders headers={response.headers} spec={spec} />
              {response.content && <Tabs
                items={
                  Object.entries(response.content).map(([mediaType, mediaObj]) => {
                    return { key: mediaType, label: mediaType, children: <Schema schema={(mediaObj as MediaTypeObject).schema} spec={spec} /> }
                  })
                }
              />}
            </>)
          }))} />
      </>
    }
  </>)
}
