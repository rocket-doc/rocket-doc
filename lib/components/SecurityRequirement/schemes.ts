import { SecuritySchemeObject } from "openapi3-ts/oas31";

export type SavedCredentials = {
  apikeys?: Record<string, string>;
  basicAuth?: Record<string, string>;
  bearerAuth?: Record<string, string>;
}

export type AuthInformations = {
  headers?: Record<string, string>;
  query?: Record<string, string>;
}

export function addValueToSavedCreds(schemeName: string, scheme: SecuritySchemeObject, value: string, savedCreds: SavedCredentials): SavedCredentials {
  switch (scheme.type) {
    case "apiKey":
      return {
        ...savedCreds,
        apikeys: {
          ...savedCreds.apikeys,
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

export function getSavedCredential(schemeName: string, scheme: SecuritySchemeObject, savedCreds: SavedCredentials): string {
  switch (scheme.type) {
    case "apiKey":
      return savedCreds.apikeys?.[schemeName] ?? "";
    case "http":
      switch (scheme.scheme) {
        case "basic":
          return savedCreds.basicAuth?.[schemeName] ?? "";
        case "bearer":
          return savedCreds.bearerAuth?.[schemeName] ?? "";
        default:
          console.warn("Unsupported http scheme", scheme.scheme)
          return "";
      }
    default:
      console.warn("Unsupported scheme type", scheme.type)
      return "";
  }
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
