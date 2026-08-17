import { AuthInformations, getSavedCredential, SavedCredentials, updateAuthValueFromSchemeValue } from "@/components/SecurityRequirement/schemes";
import usePersistentState from "@/lib/hooks/persistant";
import { specificationCredentialsDefaultSchemeName, specificationCredentialsKey } from "@/lib/local_storage";
import { ParseSpecContent } from "@/lib/spec_parsing";
import { OpenAPIObject, SecuritySchemeObject } from "openapi3-ts/oas31";
import { useCallback, useEffect, useMemo, useState } from "react";

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
  }, [security, savedCreds])

  // Callback to fetch documentation document
  const reloadSpec = useCallback(async () => {
    if (!specUrl) return;
    const url = specUrl.startsWith('http://') || specUrl.startsWith('https://') ? new URL(specUrl) : new URL(specUrl, window.location.origin)
    Object.entries(authInfos.query ?? {}).forEach(([key, value]) => url.searchParams.set(key, value))
    const headers = new Headers()
    Object.entries(authInfos.headers ?? {}).forEach(([key, value]) => headers.set(key, value))

    setLoadingSpec(true)
    try {
      const response = await fetch(url.toString(), { headers, method: "GET" })
      if (!response.ok) throw new Error(`Unexpected status ${response.status}`)
      setSpec(ParseSpecContent(await response.text(), response.headers.get("content-type") ?? specUrl))
      setError("")
    } catch (e) {
      setError(`Could not load spec: ${e instanceof Error ? e.message : e}`)
    } finally {
      setLoadingSpec(false)
    }
  }, [specUrl, authInfos, setError, setSpec])

  // On mount, fetch the spec if no credentials are required
  // or if credentials are required and are saved
  useEffect(() => {
    if (!specUrl || (security && !getSavedCredential(specificationCredentialsDefaultSchemeName, security, savedCreds))) return
    reloadSpec()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only run on mount, reloading is user triggered afterwards
  }, [])

  return { loadingSpec, specError, savedCreds, setSavedCreds, authInfos, reloadSpec }
}
