import { createContext } from 'react';
import { OpenAPIObject } from "openapi3-ts/oas31"
import { AppConfig, DefaultConfig } from './config';

export const SpecContext = createContext<{
  spec: OpenAPIObject|null,
  setSpec: (spec: OpenAPIObject) => void
}>({
  spec: null,
  setSpec: () => {}
});
export const ConfigContext = createContext<AppConfig>(DefaultConfig);

