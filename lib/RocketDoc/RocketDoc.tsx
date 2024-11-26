import rocketLogo from "@/assets/rocket-doc.png";
import { Error, ErrorBoundary } from "@/components/Error/Error";
import { Home } from "@/components/Home/Home";
import Navbar from "@/components/Navbar/Navbar";
import { Operation } from "@/components/Operation/Operation";
import { SchemaRoute } from "@/components/Schema/Schema";
import SearchModal from "@/components/SearchModal/SearchModal";
import { AuthInformations, getSavedCredential, SavedCredentials, updateAuthValueFromSchemeValue } from "@/components/SecurityRequirement/schemes";
import SecurityRequirement from "@/components/SecurityRequirement/SecurityRequirement";
import '@/index.css';
import { AppConfig, DefaultConfig, Extensions, UserConfig } from "@/lib/config";
import { ConfigContext, ExtensionsContext, ModalContext, SpecContext, UserConfigContext } from "@/lib/context";
import usePersistentState from "@/lib/hooks/persistant";
import { specificationCredentialsDefaultSchemeName, specificationCredentialsKey } from "@/lib/local_storage";
import { ConfigProvider as AntdConfigProvider, Button, Spin, Splitter, theme } from "antd";
import { OpenAPIObject, SecuritySchemeObject } from "openapi3-ts/oas31";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BrowserRouter,
  HashRouter,
  Route,
  Routes,
} from "react-router-dom";
import { parse as parseYaml } from 'yaml';

export type AppProps = {
  config?: AppConfig;
  logo?: string;
  specUrl?: string;
  specRequiredSecurity?: SecuritySchemeObject;
  specRequiredSecurityScopes?: string[];
  showFileImport?: boolean;
  extensions?: Extensions;
};

export default function RocketDoc({ logo, config, extensions, showFileImport, specUrl, specRequiredSecurity, specRequiredSecurityScopes }: AppProps) {
  const [spec, setSpec] = useState<OpenAPIObject | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [userConfig, setUserConfig] = usePersistentState<UserConfig>("userConfig", { darkMode: false });
  const [navbarSize, setNavbarSize] = usePersistentState("navbarSize", 0.21111);

  useBodyDarkClass(userConfig)

  const { savedCreds, setSavedCreds, specError, reloadSpec, loadingSpec } = useSpecUrlWithSecurity(specUrl, setSpec, specRequiredSecurity)

  const appConfig = { ...DefaultConfig, ...config }
  const Router = appConfig.routerType === "browser" ? BrowserRouter : HashRouter

  return (
    <ModalContext.Provider value={{ isOpen: modalOpen, setIsOpen: setModalOpen }}>
      <SpecContext.Provider value={{ spec, setSpec }}>
        <UserConfigContext.Provider value={{ config: userConfig, setConfig: setUserConfig }}>
          <ConfigContext.Provider value={appConfig}>
            <ExtensionsContext.Provider value={extensions ?? {}}>
              <AntdConfigProvider theme={{ algorithm: userConfig.darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm }}>
                <Router>
                  <SearchModal />
                  <Splitter onResizeEnd={(sizes) => setNavbarSize(sizes[0] / window.innerWidth)}>
                    <Splitter.Panel collapsible defaultSize={`${Math.round(100 * navbarSize)}%`} max='50%' min='10%' style={{ padding: 0 }}>
                      <Navbar
                        logo={logo ?? rocketLogo}
                        showSpecFileLoader={showFileImport ?? true}
                        defaultTitle={appConfig.defaultTitle}
                      />
                    </Splitter.Panel>
                    <Splitter.Panel className="h-screen overflow-y-auto ml-2">
                      {
                        loadingSpec ? <div className="flex justify-center items-center flex-col min-h-screen">
                          <h2 className="text-2xl" >Loading spec...</h2>
                          <Spin size="large" />
                        </div> :
                          !spec && specRequiredSecurity ?
                            <div className="flex justify-center items-center flex-col min-h-screen">
                              <h1 className="text-2xl mb-2 text-center"> Credentials are required to access OpenAPI specification</h1>
                              <SecurityRequirement
                                requirement={{ specificationCredentialsDefaultSchemeName: specRequiredSecurityScopes ?? [] }}
                                savedCreds={savedCreds}
                                setSavedCreds={setSavedCreds}
                                schemes={{ specificationCredentialsDefaultSchemeName: specRequiredSecurity }}
                                typeAsName
                              />
                              <div className="my-2 flex justify-center items-center flex-col">
                                {specError && <p className="text-red-500">
                                  {specError}
                                </p>}
                                <Button className="my-2" onClick={reloadSpec}>Load OpenAPI</Button>
                              </div>
                            </div> :
                            <Routes>
                              <Route path="*" element={<Error title="Not Found" message="The page you are looking for does not exist, or not for this spec" />} />
                              <Route index element={<Home />} ErrorBoundary={ErrorBoundary} />
                              <Route
                                path="/operations/:method/:path"
                                Component={Operation}
                                ErrorBoundary={ErrorBoundary}
                                loader={({ params }) => ({ method: params.method, path: params.path })}
                              />
                              <Route
                                path="/schemas/:name"
                                Component={SchemaRoute}
                                ErrorBoundary={ErrorBoundary}
                                loader={({ params }) => ({ name: params.name })}
                              />
                            </Routes>}
                    </Splitter.Panel>
                  </Splitter>
                </Router>
              </AntdConfigProvider>
            </ExtensionsContext.Provider>
          </ConfigContext.Provider>
        </UserConfigContext.Provider>
      </SpecContext.Provider>
    </ModalContext.Provider >
  )
}

function useBodyDarkClass(cfg: UserConfig) {
  useEffect(() => {
    if (cfg?.darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [cfg.darkMode]);
}

function useSpecUrlWithSecurity(
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
    let url = new URL(specUrl)
    Object.entries(authInfos.query ?? {}).forEach(([key, value]) => url.searchParams.set(key, value))
    let headers = new Headers()
    Object.entries(authInfos.headers ?? {}).forEach(([key, value]) => headers.set(key, value))
    setLoadingSpec(true)
    fetch(url.toString(), {
      headers: headers,
      method: "GET",
    }).then((res) => {
      if (res.status !== 200) {
        console.warn("could not load spec")
        setError("Got status " + res.status);
        return
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
    }).catch(
      (e) => {
        console.warn(`Could not load spec ${e}`)
        setError(`Could not load spec: ${e}`)
      }
    ).finally(() => setLoadingSpec(false))
  }, [specUrl, authInfos])

  // On mount, fetch the spec if no credentials are required
  // or if credentials are required and are saved
  useEffect(() => {
    if (!specUrl || (security && !getSavedCredential(specificationCredentialsDefaultSchemeName, security, savedCreds))) return
    reloadSpec()
  }, [])

  return { loadingSpec, specError, savedCreds, setSavedCreds, authInfos, reloadSpec }
} 
