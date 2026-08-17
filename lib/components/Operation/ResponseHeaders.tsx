import { MarkdownWithUrl } from "@/components/MarkdownWithUrl";
import { Schema } from "@/components/Schema/Schema";
import { GetRef } from "@/lib/ref";
import { Table, Typography } from "antd";
import { HeaderObject, OpenAPIObject, ReferenceObject } from "openapi3-ts/oas31";

type ResponseHeadersProps = {
  headers?: Record<string, HeaderObject | ReferenceObject>;
  spec: OpenAPIObject;
}

type ParsedHeader = HeaderObject & { key: string; name: string };

// Renders the headers of a response, they are documented like parameters but keyed by name
export function ResponseHeaders({ headers, spec }: ResponseHeadersProps) {
  const parsedHeaders: ParsedHeader[] = Object.entries(headers ?? {}).map(([name, header]) => ({
    key: name,
    name,
    ...GetRef<HeaderObject>(header, spec)[0],
  }));

  if (parsedHeaders.length === 0) return null;

  return (<>
    <h3 className="text-lg mt-2">Headers</h3>
    <Table<ParsedHeader>
      pagination={false}
      dataSource={parsedHeaders}
      rootClassName="overflow-x-auto"
      size="small"
      columns={[
        {
          key: 'name',
          title: 'Header',
          render: (_, header) => (<>
            <Typography.Text code>{header.name}</Typography.Text>
            {header.required && <span className="text-red-500 ml-1">*</span>}
            {header.description && <div className="pl-2"><small><MarkdownWithUrl>{header.description}</MarkdownWithUrl></small></div>}
          </>),
          className: "!p-1",
        },
        {
          key: 'schema',
          title: 'Type',
          render: (_, header) => header.schema ? <Schema schema={header.schema} spec={spec} /> : null,
          className: "!p-1",
        },
        {
          key: 'deprecated',
          title: '',
          render: (_, header) => header.deprecated ? <span className="italic text-gray-500">deprecated</span> : null,
          className: "!p-1",
        },
      ]}
    />
  </>)
}
