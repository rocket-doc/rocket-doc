import { SecuritySchemeObject } from "openapi3-ts/oas31";

export type CredentialsType = 'apiKey' | 'basicAuth' | 'bearerAuth';

export type SavedCredentials = {
  [K in CredentialsType]?: Record<string, string>;
}

export type InitialCredentials = {
  [K in CredentialsType]?: string;
}

export type AuthInformations = {
  headers?: Record<string, string>;
  query?: Record<string, string>;
}

export type Profile = {
  name: string;
  credentials: SavedCredentials;
}

export type ProfileStore = {
  profiles: Record<string, Profile>;
  currentProfileId: string;
}

export function addValueToSavedCreds(schemeName: string, scheme: SecuritySchemeObject, value: string, savedCreds: SavedCredentials): SavedCredentials {
  switch (scheme.type) {
    case "apiKey":
      return {
        ...savedCreds,
        apiKey: {
          ...savedCreds.apiKey,
          [schemeName]: value
        }
      }
    case "http":
      switch (scheme.scheme) {
        case "basic":
          return {
            ...savedCreds,
            basicAuth: {
              ...savedCreds.basicAuth,
              [schemeName]: value
            }
          }
        case "bearer":
          return {
            ...savedCreds,
            bearerAuth: {
              ...savedCreds.bearerAuth,
              [schemeName]: value
            }
          }
        default:
          console.warn("Unsupported http scheme", scheme.scheme)
          return savedCreds;
      }
    default:
      console.warn("Unsupported scheme type", scheme.type)
      return savedCreds;
  }
}

export function schemeToCredentialType(scheme: SecuritySchemeObject): CredentialsType | undefined {
  switch (scheme.type) {
    case "apiKey":
      return "apiKey";
    case "http":
      switch (scheme.scheme) {
        case "basic":
          return "basicAuth";
        case "bearer":
          return
        default:
          console.warn("Unsupported http scheme", scheme.scheme)
          return undefined
      }
    default:
      console.warn("Unsupported scheme type", scheme.type)
      return undefined;
  }
}

export function getSavedCredential(schemeName: string, scheme: SecuritySchemeObject, savedCreds: SavedCredentials): string {
  const credsType = schemeToCredentialType(scheme);
  if (!credsType) return "";
  return savedCreds[credsType]?.[schemeName] ?? "";
}

export function updateAuthValueFromSchemeValue(schemeName: string, scheme: SecuritySchemeObject, value: string, authValue: AuthInformations): AuthInformations {
  switch (scheme.type) {
    case "apiKey":
      if (!scheme.name) {
        console.warn(`scheme name is undefined for apiKey scheme ${schemeName} in query`)
        return authValue;
      }
      switch (scheme.in) {
        case "query":
          return {
            ...authValue,
            query: {
              ...authValue.query,
              [scheme.name]: value
            }
          }
        case "header":
          return {
            ...authValue,
            headers: {
              ...authValue.headers,
              [scheme.name]: value
            }
          }
        default:
          console.warn("Unsupported apiKey location", scheme.in)
          return authValue;
      }
    case "http":
      switch (scheme.scheme) {
        case "basic":
          return {
            ...authValue,
            headers: {
              ...authValue.headers,
              Authorization: `Basic ${btoa(value)}`
            }
          }
        case "bearer":
          return {
            ...authValue,
            headers: {
              ...authValue.headers,
              Authorization: `Bearer ${value}`
            }
          }
        default:
          console.warn("Unsupported http scheme", scheme.scheme)
          return authValue;
      }
    default:
      console.warn("Unsupported scheme type", scheme.type)
      return authValue;
  }
}
