import { IconEye, IconEyeOff } from "@tabler/icons-react";
import { Input, InputProps } from "antd";
import { useState } from "react";

export function HiddenInput(
  props: InputProps
): JSX.Element {
  const [visible, setVisible] = useState(false);

  let Icon = visible ? IconEyeOff : IconEye;
  return <div className="flex relative items-center">
    <Input {...props} type={visible ? "text" : "password"} />
    <Icon onClick={() => setVisible(!visible)} className="pl-1 cursor-pointer hover:opacity-50 transition-all" size={20} />
  </div>;
}
