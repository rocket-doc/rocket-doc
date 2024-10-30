import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-xml-doc';
import 'prismjs/themes/prism-tomorrow.css';

export enum Language {
  JSON = 'json',
  XML = 'xml',
  YAML = 'yaml',
  PLAIN = 'plain'
}

type CodeEditorProps = {
  code: string;
  setCode: (code: string) => void;
  language?: Language;
}

export const grammarMap: Record<Language, Prism.Grammar> = {
  [Language.JSON]: Prism.languages.json,
  [Language.XML]: Prism.languages.xml,
  [Language.PLAIN]: Prism.languages.plain,
  [Language.YAML]: Prism.languages.yaml
}

export const langMap: Record<Language, string> = {
  [Language.JSON]: 'json',
  [Language.XML]: 'xml',
  [Language.PLAIN]: 'plain',
  [Language.YAML]: 'yaml'
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
