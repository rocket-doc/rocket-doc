// Quotes a value for a POSIX shell, single quotes inside the value are escaped
export function ShellQuote(value: string): string {
  return `'${value.replace(/'/g, `'\\''`)}'`;
}

export type CurlRequestInput = {
  method?: string;
  url: string;
  headers?: Record<string, string>;
  body?: string | null;
};

// BuildCurlCommand renders a copy-pastable curl command for the given request
export function BuildCurlCommand({ method, url, headers, body }: CurlRequestInput): string {
  const lines = [`curl -X ${(method ?? 'GET').toUpperCase()} ${ShellQuote(url)}`];

  Object.entries(headers ?? {}).forEach(([name, value]) =>
    lines.push(`-H ${ShellQuote(`${name}: ${value}`)}`)
  );

  if (body) lines.push(`-d ${ShellQuote(body)}`);

  return lines.join(' \\\n  ');
}
