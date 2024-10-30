import { useEffect, useState } from "react";

export function useWidth(elem: HTMLElement | null) {
  const [width, setWidth] = useState(elem?.offsetWidth ?? undefined)
  useEffect(() => {
    if (!elem) {
      setWidth(undefined)
      return
    }
    const sizeUpdate = () => {
      setWidth(elem?.offsetWidth)
    }
    window.addEventListener("resize", sizeUpdate)

    return () => window.removeEventListener("resize", sizeUpdate)
  }, [elem])

  return width
}
