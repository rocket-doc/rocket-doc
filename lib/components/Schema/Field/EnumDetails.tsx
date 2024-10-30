import { Code } from "@/components/Code/Code";
import { MarkdownWithUrl } from "@/components/MarkdownWithUrl";
import { EnumDetail } from "@/lib/types";
import { Table } from "antd";
import { ReactNode } from "react";

type EnumDetailsProps = {
  enumDetails: EnumDetail[];
  depth: number;
}

export function EnumDetails({ enumDetails, depth }: EnumDetailsProps): ReactNode {

  return (<tr>
    <td colSpan={2} className="py-1" style={{ paddingLeft: `${depth + 1}em` }}>
      <div className="ml-[15px] pl-1 flex">
        <Table<EnumDetail>
          pagination={false}
          dataSource={enumDetails}
          size="small"
          showHeader={false}
          rowHoverable={false}
          className="nopadding"
          columns={[
            {
              title: "Name",
              dataIndex: "varname",
              key: "description",
              render: (varname) => <Code>{varname}</Code>,
              className: "!py-1",
            },
            {
              title: "Value",
              dataIndex: "value",
              key: "value",
              render: (value) => <Code>{value}</Code>,
              className: "!py-1",
            },
            {
              title: "Description",
              dataIndex: "description",
              key: "description",
              render: (desc) => <MarkdownWithUrl>{desc}</MarkdownWithUrl>,
              hidden: enumDetails.every(e => !e.description),
              className: "!py-1",
            }]}
        />
      </div>
    </td>
  </tr>)
}
