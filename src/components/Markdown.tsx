import MarkdownIt from "markdown-it";
import { useEffect, useState, ElementType } from "react";

type MarkdownProps = {
  contentMd?: string;
}


export function Markdown<T extends ElementType = 'div'>({ contentMd, as }: MarkdownProps & { as?: T }) {
  const [descriptionHTML, setDescHTML] = useState<string | null>(null);

  useEffect(() => {
    if (contentMd) {
      const md = new MarkdownIt({
        breaks: true,
      });
      setDescHTML(md.render(contentMd));
    }
  }, [contentMd, setDescHTML]);

  if (!descriptionHTML) return null;

  const Component = as || 'div';

  return (
    <Component dangerouslySetInnerHTML={{ __html: descriptionHTML }} />
  )
}
