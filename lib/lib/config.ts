import { OpenAPIObject, SchemaObject } from "openapi3-ts/oas31";

export type AppConfig = {
  defaultExpandedDepth?: number;
  routerType?: 'hash' | 'browser';
  basePath?: string;
  defaultTitle?: string;
};

export const DefaultConfig: Required<AppConfig> = {
  defaultExpandedDepth: 2,
  routerType: 'hash',
  basePath: '',
  defaultTitle: 'Rocket Doc',
};

// User config is stored in local storage, and is used to store user preferences
export type UserConfig = {
  darkMode?: boolean;
};

export type Extensions = {
  // This component is used to render the details of a field in the schema for custom types
  // if not provided, or returns null no custom rendering will be done
  fieldDetails?: (req: { name: string; schema: SchemaObject; fullSpec: OpenAPIObject }) => {
    component: (null | React.ComponentType);
    disablePadding?: boolean;
  };
};
