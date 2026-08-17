import { describe, expect, it } from 'vitest';
import { BuildCurlCommand, ShellQuote } from './curl';

describe('ShellQuote', () => {
  it('quotes plain values', () => {
    expect(ShellQuote('hello world')).toBe(`'hello world'`);
  });

  it('escapes single quotes', () => {
    expect(ShellQuote(`it's`)).toBe(`'it'\\''s'`);
  });
});

describe('BuildCurlCommand', () => {
  it('renders method, headers and body', () => {
    expect(
      BuildCurlCommand({
        method: 'post',
        url: 'https://api.test/pets',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer x' },
        body: '{"name":"rex"}',
      })
    ).toBe(
      [
        `curl -X POST 'https://api.test/pets'`,
        `-H 'Content-Type: application/json'`,
        `-H 'Authorization: Bearer x'`,
        `-d '{"name":"rex"}'`,
      ].join(' \\\n  ')
    );
  });

  it('defaults to GET and omits an empty body', () => {
    expect(BuildCurlCommand({ url: 'https://api.test/pets' })).toBe(`curl -X GET 'https://api.test/pets'`);
  });
});
