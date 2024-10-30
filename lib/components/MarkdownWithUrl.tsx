import { ConfigContext } from "@/lib/context";
import { useCallback, useContext } from "react";
import Markdown, { Options } from "react-markdown";
import { Link } from "react-router-dom";

export function MarkdownWithUrl({ children, urlTransform, ...rest }: Options) {
  const urlTransformer = useUrlTransformer();

  return <Markdown components={{
    a: (a) => <Link to={a.href ?? ""}>{a.children}</Link>
  }} urlTransform={urlTransform || urlTransformer} {...rest}>{children}</Markdown >;
}


const isAbsoluteUrl = (url: string) => /^(?:[a-z]+:)?\/\//i.test(url);
function useUrlTransformer() {
  const { routerType, basePath } = useContext(ConfigContext)

  return useCallback((url: string) => {
    if (isAbsoluteUrl(url)) {
      return url;
    }

    if (routerType === "hash") {
      return `#${url}`;
    }

    return `${basePath}${url.startsWith("/") ? `${url}` : `/${url}`}`;
  }, [routerType, basePath])
}
