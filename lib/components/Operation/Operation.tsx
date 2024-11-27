import DeprecatedTooltip from "@/components/DeprecatedTooltip";
import { Error } from "@/components/Error/Error";
import { Parameters } from "@/components/Parameters/Parameters";
import { Schema } from "@/components/Schema/Schema";
import { TryIt } from "@/components/TryIt/TryIt";
import { SpecContext } from "@/lib/context";
import { useOperationFromRouter } from "@/lib/hooks/router";
import { HttpMethod, Operation as OperationType } from "@/lib/operations";
import { GetRef } from "@/lib/ref";
import { Tabs } from 'antd';
import { MediaTypeObject, OpenAPIObject } from "openapi3-ts/oas31";
import { useContext, useMemo } from "react";
import { MarkdownWithUrl } from "../MarkdownWithUrl";

export type OperationURLParams = {
  method: HttpMethod;
  path: string;
}

export function Operation() {
  const { spec } = useContext(SpecContext);
  const operation = useOperationFromRouter();

  if (!spec) return <Error title="Spec not loaded yet" />;
  if (!operation) return <Error title="Operation not found in current spec" />;

  return (
    <div className="m-2">
      <div>
        {operation.deprecated &&
          <h1 className="text-red-400 text-xl font-extrabold flex items-center">
            <span>Deprecated</span>
            <DeprecatedTooltip />
          </h1>
        }
        <h1 className="text-3xl font-bold flex items-center">
          <span className={`httpmethod-${operation.method.toLowerCase()} uppercase`}>
            {operation.method}
          </span>
          <span className="ml-2 text-gray-500 dark:text-white">{operation.path}</span>
        </h1>
        {operation.summary && <h2 className="text-lg">{operation.summary}</h2>}
        <small className="text-gray-500 dark:text-white flex items-center">
          <span className="font-bold">Try it out</span>
          <span className="ml-1"> by switching tabs</span>
        </small>
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

  return (<>
    {
      operation.description && <>
        <h2 className="text-2xl">Description</h2>
        <MarkdownWithUrl className="m-2 mr-0">{operation.description}</MarkdownWithUrl>
      </>
    }
    {
      operation.parameters && <>
        <h2 className="text-2xl">Parameters</h2>
        <Parameters parameters={operation.parameters} />
      </>
    }
    {
      bodyObj && <>
        <h2 className="text-2xl">Request Body</h2>
        <Tabs items={
          Object.entries(bodyObj.content).map(([mediaType, mediaObj]) => {
            return { key: mediaType, label: mediaType, children: <Schema schema={mediaObj.schema} spec={spec} /> }
          })
        } />
      </>
    }
    {
      operation.responses && <>
        <h2 className="text-2xl">Responses</h2>
        <small className="text-s">Status</small>
        <Tabs
          tabBarStyle={{ marginBottom: 0 }}
          items={Object.entries(operation.responses).map(([status, response]) => ({
            key: status, label: status, children: (<>
              {response.description && <>
                <MarkdownWithUrl>{response.description}</MarkdownWithUrl>
              </>}
              {response.content && <>
                <Tabs
                  items={
                    Object.entries(response.content).map(([mediaType, mediaObj]) => {
                      return { key: mediaType, label: mediaType, children: <Schema schema={(mediaObj as MediaTypeObject).schema} spec={spec} /> }
                    })
                  }
                />
              </>}
            </>)
          }))} />
      </>
    }
  </>)
}
