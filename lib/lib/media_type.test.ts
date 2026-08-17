import { describe, expect, it } from 'vitest';
import { Language } from './language';
import { IsYamlMediaType, MediaTypeToLanguage } from './media_type';

describe('IsYamlMediaType', () => {
  it('detects yaml media types', () => {
    expect(IsYamlMediaType('application/yaml')).toBe(true);
    expect(IsYamlMediaType('text/yaml; charset=utf-8')).toBe(true);
    expect(IsYamlMediaType('application/vnd.api+yaml')).toBe(true);
  });

  it('rejects other media types', () => {
    expect(IsYamlMediaType('application/json')).toBe(false);
    expect(IsYamlMediaType(null)).toBe(false);
    expect(IsYamlMediaType(undefined)).toBe(false);
  });
});

describe('MediaTypeToLanguage', () => {
  it('maps media types to languages', () => {
    expect(MediaTypeToLanguage('application/json')).toBe(Language.JSON);
    expect(MediaTypeToLanguage('application/vnd.api+json; charset=utf-8')).toBe(Language.JSON);
    expect(MediaTypeToLanguage('application/xml')).toBe(Language.XML);
    expect(MediaTypeToLanguage('text/yaml')).toBe(Language.YAML);
    expect(MediaTypeToLanguage('text/plain')).toBe(Language.PLAIN);
    expect(MediaTypeToLanguage(undefined)).toBe(Language.PLAIN);
  });
});
