import { SpecContext } from "@/lib/context";
import { ParseSpecContent } from "@/lib/spec_parsing";
import { IconFileArrowLeft } from "@tabler/icons-react";
import { useContext, useState } from "react";

const acceptedExtensions = ['.json', '.yaml', '.yml'];

export function FileLoader() {
  const { setSpec } = useContext(SpecContext);
  const [error, setError] = useState<string | null>(null);

  const loadFile = async (file: File) => {
    if (!acceptedExtensions.some((extension) => file.name.toLowerCase().endsWith(extension))) {
      setError(`Unsupported file format: ${file.name}`);
      return;
    }
    try {
      setSpec(ParseSpecContent(await file.text(), file.name));
      setError(null);
    } catch (e) {
      setError(`Could not parse ${file.name}: ${e instanceof Error ? e.message : e}`);
    }
  };

  return (<>
    <label className='cursor-pointer rounded-md px-3 py-2 mx-2 flex items-center gap-2 text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/10'>
      <IconFileArrowLeft className='flex-shrink-0' size={20} />
      <span className='whitespace-nowrap'>Import file</span>
      <input
        className='hidden'
        type="file"
        accept={acceptedExtensions.join(',')}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) loadFile(file);
        }}
      />
    </label>
    {error && <p className='mx-4 text-xs text-red-500'>{error}</p>}
  </>);
}
