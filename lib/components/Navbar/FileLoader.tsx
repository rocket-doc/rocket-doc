import { useContext } from "react";
import { SpecContext } from "@/lib/context";
import { IconFileArrowLeft } from "@tabler/icons-react";
import { parse as parseYaml } from 'yaml'

export function FileLoader() {
  const { setSpec } = useContext(SpecContext);
  return (<label className='cursor-pointer hover:bg-gray-700 p-2 flex items-center'>
    <IconFileArrowLeft className='mr-2 flex-shrink-0' size={24} />
    <span className='whitespace-nowrap'>Import file</span>
    <input
      className='hidden'
      type="file"
      accept=".json,.yaml,.yml"
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            try {
              if (file.name.endsWith('.yaml') || file.name.endsWith('.yml')) {
                const content = event.target?.result;
                if (content) {
                  const spec = parseYaml(content as string);
                  setSpec(spec);
                }
                return;
              } else if (!file.name.endsWith('.json')) {
                console.error('Unsupported file format:', file.name);
                return;
              }
              const content = event.target?.result;
              if (content) {
                const spec = JSON.parse(content as string);
                setSpec(spec);
              }
            } catch (error) {
              console.error('Error parsing the spec file:', error);
            }
          };
          reader.readAsText(file);
        }
      }}
    />
  </label>);
}
