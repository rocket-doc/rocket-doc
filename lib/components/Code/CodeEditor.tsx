import { langMap, Language } from '@/lib/language';
import Prism from 'prismjs';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-xml-doc';
import 'prismjs/components/prism-yaml';
import 'prismjs/themes/prism-tomorrow.css';
import Editor from 'react-simple-code-editor';

export { langMap, Language };

type CodeEditorProps = {
  code: string;
  setCode: (code: string) => void;
  language?: Language;
}

export const grammarMap: Record<Language, Prism.Grammar> = {
  [Language.JSON]: Prism.languages.json,
  [Language.XML]: Prism.languages.xml,
  [Language.PLAIN]: Prism.languages.plain,
  [Language.YAML]: Prism.languages.yaml,
  [Language.BASH]: Prism.languages.bash
}

export function CodeEditor({
  code,
  setCode,
  language = Language.JSON,
}: CodeEditorProps & React.HTMLAttributes<HTMLDivElement>) {

  return (
    <Editor
      value={code}
      onValueChange={code => setCode(code)}
      highlight={code => Prism.highlight(code, grammarMap[language], langMap[language])}
      padding={10}
      style={{
        fontFamily: '"Fira code", "Fira Mono", monospace',
        fontSize: 12,
        color: 'white',
        backgroundColor: '#2d2d2d',
        border: '1px solid #444',
        borderRadius: '4px',
      }}
    />
  );
}
