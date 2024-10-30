import { Typography } from "antd";
import { TextProps } from "antd/es/typography/Text";

export function Code({ children, className }: TextProps) {
  return <Typography.Text className={className} code>{children}</Typography.Text>
}
