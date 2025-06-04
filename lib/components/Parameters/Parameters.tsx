import { Schema } from "@/components/Schema/Schema";
import { SpecContext } from "@/lib/context";
import { GetRef } from "@/lib/ref";
import { Card, Table, Typography } from "antd";
import { ParameterObject, ReferenceObject } from "openapi3-ts/oas31";
import { useContext } from "react";
import { MarkdownWithUrl } from "../MarkdownWithUrl";

type ParametersProps = {
  parameters?: (ParameterObject | ReferenceObject)[];
}

export function Parameters({ parameters }: ParametersProps) {
  const { spec } = useContext(SpecContext);
  if (!parameters || !spec) return null;

  return (<Table<ParameterObject>
    pagination={false}
    dataSource={parameters.map((p, i) => ({ key: i, ...GetRef(p, spec)[0] }))}
    rootClassName="overflow-x-auto"
    size="small"
    columns={[
      {
        key: 'name',
        title: 'Parameter',
        render: (_, param) => (<>
          <Typography.Text code>{param.name}</Typography.Text>
          {param.description && <div className="pl-2"><small><MarkdownWithUrl>{param.description}</MarkdownWithUrl></small></div>}
        </>),
        className: "!p-1",
      },
      {
        key: 'schema',
        title: 'Type',
        render: (_, param) => param.schema ? <Schema schema={param.schema} spec={spec} /> : (
          Object.entries(param.content ?? {}).map(([name, content]) => (
            <Card key={name} title={`Content-Type: ${name}`}>
              <Schema schema={content.schema} spec={spec} />
            </Card>
          ))
        ),
        className: "!p-1",
      },
      {
        key: 'in',
        title: 'Location',
        render: (_, param) => <span className="italic text-gray-500">{param.in}</span>,
        className: "!p-1",
      }
    ]}

  />)
}
