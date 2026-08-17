import { Language } from '@/lib/language';

export type MediaType = string;

const yamlMediaTypes = [
  'application/yaml',
  'application/yml',
  'application/x-yaml',
  'application/x-yml',
  'text/yaml',
  'text/yml',
  'text/x-yaml',
];

const jsonMediaTypes = ['application/json', 'text/json'];

const xmlMediaTypes = ['application/xml', 'text/xml'];

// Strips media type parameters & suffixes, `application/vnd.api+json; charset=utf-8` becomes `application/json`
function normalizeMediaType(mediaType: MediaType): string {
  const withoutParameters = mediaType.split(';')[0].trim().toLowerCase();
  const [type, subtype] = withoutParameters.split('/');
  if (!subtype) return withoutParameters;
  const suffix = subtype.split('+')[1];
  return suffix ? `${type}/${suffix}` : withoutParameters;
}

export function IsYamlMediaType(mediaType: MediaType | null | undefined): boolean {
  if (!mediaType) return false;
  return yamlMediaTypes.includes(normalizeMediaType(mediaType));
}

export function MediaTypeToLanguage(mediaType: MediaType | null | undefined): Language {
  if (!mediaType) return Language.PLAIN;
  const normalized = normalizeMediaType(mediaType);
  if (jsonMediaTypes.includes(normalized)) return Language.JSON;
  if (xmlMediaTypes.includes(normalized)) return Language.XML;
  if (yamlMediaTypes.includes(normalized)) return Language.YAML;
  return Language.PLAIN;
}
