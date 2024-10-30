import { useWidth } from "@/lib/hooks/width";
import { useMemo, useRef, useState } from "react";

type TextEllipsisProps = {
  content: string;
}
export default function TextEllipsis({
  content
}: TextEllipsisProps) {
  const [expanded, setExpanded] = useState(false);
  const p = useRef<HTMLParagraphElement | null>(null);
  const pWidth = useWidth(p.current);

  const needsResize = useMemo(() => {
    if (!p.current || !pWidth) return false
    return (pWidth < p.current.scrollWidth);
  }, [pWidth])

  return (< p ref={p} onClick={() => setExpanded(!expanded)} className={(expanded ? "" : "text-ellipsis overflow-hidden whitespace-nowrap ") + (needsResize ? "cursor-pointer" : "")} >
    {content}
  </p >)

}
