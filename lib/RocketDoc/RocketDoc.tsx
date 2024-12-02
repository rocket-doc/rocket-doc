import rocketLogo from "@/assets/rocket-doc.png";
import { ErrorBoundary, Error as ErrorElement } from "@/components/Error/Error";
import { Home } from "@/components/Home/Home";
import Navbar from "@/components/Navbar/Navbar";
import { Operation } from "@/components/Operation/Operation";
import { SchemaRoute } from "@/components/Schema/Schema";
import SearchModal from "@/components/SearchModal/SearchModal";
import SecurityRequirement from "@/components/SecurityRequirement/SecurityRequirement";
import '@/index.css';
import { AppConfig, DefaultConfig, Extensions, UserConfig } from "@/lib/config";
import { ConfigContext, ExtensionsContext, ModalContext, SpecContext, UserConfigContext } from "@/lib/context";
import usePersistentState from "@/lib/hooks/persistant";
import { specificationCredentialsDefaultSchemeName } from "@/lib/local_storage";
import { ConfigProvider as AntdConfigProvider, Button, Spin, Splitter, theme } from "antd";
import { OpenAPIObject, SecuritySchemeObject } from "openapi3-ts/oas31";
import { useEffect, useState } from "react";
import {
  BrowserRouter,
  HashRouter,
  Route,
  Routes,
} from "react-router-dom";
import { useSpecUrlWithSecurity } from "./spec";

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
                        showClearSpec={!!spec && !!specUrl && !!specRequiredSecurity}
                        defaultTitle={appConfig.defaultTitle}
                      />
                    </Splitter.Panel>
                    <Splitter.Panel className="h-screen overflow-y-auto ml-2">
                      {!spec && <div className="flex justify-center items-center flex-col min-h-screen">
                        {!loadingSpec && specRequiredSecurity &&
                          <>
                            <h1 className="text-2xl mb-2 text-center"> Credentials are required to access OpenAPI specification</h1>
                            <SecurityRequirement
                              requirement={{ [specificationCredentialsDefaultSchemeName]: specRequiredSecurityScopes ?? [] }}
                              savedCreds={savedCreds}
                              setSavedCreds={setSavedCreds}
                              schemes={{ [specificationCredentialsDefaultSchemeName]: specRequiredSecurity }}
                              typeAsName
                            />
                          </>}
                        {!loadingSpec && <div className="my-2 flex justify-center items-center flex-col">
                          <Button className="my-2" onClick={reloadSpec}>Load OpenAPI</Button>
                        </div>}
                        {loadingSpec && <>
                          <h2 className="text-2xl" >Loading spec...</h2>
                          <Spin size="large" />
                        </>}
                        {specError && !loadingSpec && <p className="text-red-500">
                          {specError}
                        </p>}

                      </div>}
                      {spec && <Routes>
                        <Route path="*" element={<ErrorElement title="Not Found" message="The page you are looking for does not exist, or not for this spec" />} />
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
