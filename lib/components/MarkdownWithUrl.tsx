import Markdown, { Options } from "react-markdown";
import { Link } from "react-router-dom";

function isExternal(href: string): boolean {
  return /^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith("//");
}

// Internal links are routed by the router, external ones are opened in a new tab
export function MarkdownWithUrl({ children, ...rest }: Options) {
  return <Markdown components={{
    a: ({ href, children }) => isExternal(href ?? "")
      ? <a href={href} target="_blank" rel="noreferrer">{children}</a>
      : <Link to={href ?? ""}>{children}</Link>
  }} {...rest}>{children}</Markdown >;
}
