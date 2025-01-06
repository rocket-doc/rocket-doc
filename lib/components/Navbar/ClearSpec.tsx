import { SpecContext } from "@/lib/context";
import { IconForbid2 } from "@tabler/icons-react";
import { Tooltip } from "antd";
import { useContext } from "react";

export function ClearSpec() {
  const { setSpec } = useContext(SpecContext);
  return (<Tooltip className='cursor-pointer hover:bg-gray-700 flex my-auto mx-2 items-center' title="Clear current spec">
    <IconForbid2 size={30} onClick={() => setSpec(null)} />
  </Tooltip>);
}
