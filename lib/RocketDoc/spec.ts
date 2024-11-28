import { AuthInformations, getSavedCredential, SavedCredentials, updateAuthValueFromSchemeValue } from "@/components/SecurityRequirement/schemes";
import usePersistentState from "@/lib/hooks/persistant";
import { specificationCredentialsDefaultSchemeName, specificationCredentialsKey } from "@/lib/local_storage";
import { OpenAPIObject, SecuritySchemeObject } from "openapi3-ts/oas31";
import { useCallback, useEffect, useMemo, useState } from "react";
import { parse as parseYaml } from 'yaml';

export function useSpecUrlWithSecurity(
  specUrl: string | undefined,
  setSpec: (v: OpenAPIObject | null) => void,
  security: SecuritySchemeObject | undefined,
) {
  const [specError, setError] = useState("")
  const [savedCreds, setSavedCreds] = usePersistentState<SavedCredentials>(specificationCredentialsKey, {});
  const [loadingSpec, setLoadingSpec] = useState(false);

  const authInfos = useMemo<AuthInformations>(() => {
    if (!security) {
      return {}
    }
    return updateAuthValueFromSchemeValue(
      specificationCredentialsDefaultSchemeName,
      security,
      getSavedCredential(specificationCredentialsDefaultSchemeName, security, savedCreds),
      {}
    )
  }, [savedCreds])

  // Callback to fetch documentation document
  const reloadSpec = useCallback(() => {
    if (!specUrl) return;
    let url = specUrl.startsWith('http://') || specUrl.startsWith('https://') ? new URL(specUrl) : new URL(specUrl, window.location.origin)
    Object.entries(authInfos.query ?? {}).forEach(([key, value]) => url.searchParams.set(key, value))
    let headers = new Headers()
    Object.entries(authInfos.headers ?? {}).forEach(([key, value]) => headers.set(key, value))
    setLoadingSpec(true)
    fetch(url.toString(), {
      headers: headers,
      method: "GET",
    }).then((res) => {
      if (res.status !== 200) {
        throw `Unexpected status ${res.status}`;
      }
      switch (res.headers.get("content-type")) {
        case "application/x-yaml":
        case "text/yaml":
        case "application/yaml":
        case "application/yml":
          res.text().then(content => {
            return parseYaml(content);
          })
          break;
        default:
          // Default is JSON
          return res.json()
      }
    }).then(o => {
      setSpec(o)
      setError("")
    }).catch((e) => {
      setError(`Could not load spec: ${e}`)
    }).finally(() => setLoadingSpec(false))
  }, [specUrl, authInfos, setError, setSpec])

  // On mount, fetch the spec if no credentials are required
  // or if credentials are required and are saved
  useEffect(() => {
    if (!specUrl || (security && !getSavedCredential(specificationCredentialsDefaultSchemeName, security, savedCreds))) return
    reloadSpec()
  }, [])

  return { loadingSpec, specError, savedCreds, setSavedCreds, authInfos, reloadSpec }
} 
