import { SpecContext } from "@/lib/context";
import { IconSquareX } from "@tabler/icons-react";
import { useContext } from "react";

export function ClearSpec() {
  const { setSpec } = useContext(SpecContext);
  return (<label className='cursor-pointer hover:bg-gray-700 p-2 flex items-center' onClick={() => setSpec(null)}>
    <IconSquareX className='mr-2 flex-shrink-0' size={24} />
    <span className='whitespace-nowrap'>Clear current spec</span>
  </label>);
}
