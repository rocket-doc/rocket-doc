import { OpenAPIObject } from 'openapi3-ts/oas31';
import { createContext } from 'react';
import { AppConfig, DefaultConfig, Extensions, UserConfig } from './config';

export const SpecContext = createContext<{
  spec: OpenAPIObject | null;
  setSpec: (spec: OpenAPIObject | null) => void;
}>({
  spec: null,
  setSpec: () => { },
});
export const ConfigContext = createContext<Required<AppConfig>>(DefaultConfig);

export const UserConfigContext = createContext<{
  config: UserConfig;
  setConfig: (config: UserConfig) => void;
}>({
  config: {},
  setConfig: () => { },
});

export const ModalContext = createContext<{
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}>({
  isOpen: false,
  setIsOpen: () => { },
});

export const ExtensionsContext = createContext<Extensions>({});
