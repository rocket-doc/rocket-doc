export enum Language {
  JSON = 'json',
  XML = 'xml',
  YAML = 'yaml',
  PLAIN = 'plain',
  BASH = 'bash',
}

// Prism language names used for syntax highlighting
export const langMap: Record<Language, string> = {
  [Language.JSON]: 'json',
  [Language.XML]: 'xml',
  [Language.PLAIN]: 'plain',
  [Language.YAML]: 'yaml',
  [Language.BASH]: 'bash',
};
