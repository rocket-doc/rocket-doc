import Markdown, { Options } from "react-markdown";
import { Link } from "react-router-dom";

export function MarkdownWithUrl({ children, urlTransform, ...rest }: Options) {
  return <Markdown components={{
    a: (a) => <Link to={a.href ?? ""}>{a.children}</Link>
  }} {...rest}>{children}</Markdown >;
}
