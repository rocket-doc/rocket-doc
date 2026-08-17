import { describe, expect, it } from 'vitest';
import { ParseSpecContent } from './spec_parsing';

const json = '{"openapi":"3.1.0","info":{"title":"json spec","version":"1"}}';
const yaml = 'openapi: 3.1.0\ninfo:\n  title: yaml spec\n  version: "1"\n';

describe('ParseSpecContent', () => {
  it('parses JSON without hint', () => {
    expect(ParseSpecContent(json).info.title).toBe('json spec');
  });

  it('parses YAML from a media type hint', () => {
    expect(ParseSpecContent(yaml, 'application/yaml').info.title).toBe('yaml spec');
  });

  it('parses YAML from a file name hint', () => {
    expect(ParseSpecContent(yaml, 'openapi.YML').info.title).toBe('yaml spec');
  });

  it('falls back to YAML when the content is not JSON', () => {
    expect(ParseSpecContent(yaml, 'application/json').info.title).toBe('yaml spec');
  });

  it('throws on invalid content', () => {
    expect(() => ParseSpecContent('{ not: [valid', 'application/json')).toThrow();
  });
});
