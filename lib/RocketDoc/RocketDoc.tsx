import rocketLogo from "@/assets/rocket-doc.png";
import { ErrorBoundary, Error as ErrorElement } from "@/components/Error/Error";
import { Home } from "@/components/Home/Home";
import Navbar from "@/components/Navbar/Navbar";
import { Operation } from "@/components/Operation/Operation";
import { SchemaRoute } from "@/components/Schema/Schema";
import SearchModal from "@/components/SearchModal/SearchModal";
import { Security, securityRoute } from "@/components/Security/Security";
import SecurityRequirement from "@/components/SecurityRequirement/SecurityRequirement";
import '@/index.css';
import { AppConfig, DefaultConfig, Extensions, UserConfig } from "@/lib/config";
import { ConfigContext, ExtensionsContext, ModalContext, SpecContext, UserConfigContext } from "@/lib/context";
import { useIsMobile } from "@/lib/hooks/media";
import usePersistentState from "@/lib/hooks/persistant";
import { specificationCredentialsDefaultSchemeName } from "@/lib/local_storage";
import { IconMenu2 } from "@tabler/icons-react";
import { Alert, Button, ConfigProvider as AntdConfigProvider, Drawer, Spin, Splitter, theme } from "antd";
import { OpenAPIObject, SecuritySchemeObject } from "openapi3-ts/oas31";
import { ReactNode, useEffect, useState } from "react";
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
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isMobile = useIsMobile();

  useBodyDarkClass(userConfig)

  const { savedCreds, setSavedCreds, specError, reloadSpec, loadingSpec } = useSpecUrlWithSecurity(specUrl, setSpec, specRequiredSecurity)

  const appConfig = { ...DefaultConfig, ...config }
  const Router = appConfig.routerType === "browser" ? BrowserRouter : HashRouter

  const navbar = (
    <Navbar
      logo={logo ?? rocketLogo}
      showSpecFileLoader={showFileImport ?? true}
      showClearSpec={!!spec && !!specUrl && !!specRequiredSecurity}
      defaultTitle={appConfig.defaultTitle}
      onNavigate={() => setDrawerOpen(false)}
    />
  );

  const content = (
    <>
      {!spec && <SpecPlaceholder
        loading={loadingSpec}
        error={specError}
        onLoad={reloadSpec}
        securityRequirement={specRequiredSecurity && <SecurityRequirement
          requirement={{ [specificationCredentialsDefaultSchemeName]: specRequiredSecurityScopes ?? [] }}
          savedCreds={savedCreds}
          setSavedCreds={setSavedCreds}
          schemes={{ [specificationCredentialsDefaultSchemeName]: specRequiredSecurity }}
          typeAsName
        />}
      />}
      {spec && <Routes>
        <Route path="*" element={<ErrorElement title="Not Found" message="The page you are looking for does not exist, or not for this spec" />} />
        <Route index element={<Home />} ErrorBoundary={ErrorBoundary} />
        <Route
          path="/operations/:method/:path"
          element={<Operation kind="path" />}
          ErrorBoundary={ErrorBoundary}
        />
        <Route
          path="/webhooks/:method/:path"
          element={<Operation kind="webhook" />}
          ErrorBoundary={ErrorBoundary}
        />
        <Route path={securityRoute} element={<Security />} ErrorBoundary={ErrorBoundary} />
        <Route
          path="/schemas/:name"
          Component={SchemaRoute}
          ErrorBoundary={ErrorBoundary}
          loader={({ params }) => ({ name: params.name })}
        />
      </Routes>}
    </>
  );

  return (
    <ModalContext.Provider value={{ isOpen: modalOpen, setIsOpen: setModalOpen }}>
      <SpecContext.Provider value={{ spec, setSpec }}>
        <UserConfigContext.Provider value={{ config: userConfig, setConfig: setUserConfig }}>
          <ConfigContext.Provider value={appConfig}>
            <ExtensionsContext.Provider value={extensions ?? {}}>
              <AntdConfigProvider theme={{
                algorithm: userConfig.darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
                token: { borderRadius: 8, fontSize: 14 },
              }}>
                <Router>
                  <SearchModal />
                  {isMobile ? <div className="h-screen flex flex-col">
                    <div className="rd-sidebar flex items-center gap-2 px-2 py-1">
                      <Button
                        type="text"
                        aria-label="Open navigation"
                        icon={<IconMenu2 />}
                        onClick={() => setDrawerOpen(true)}
                        style={{ color: 'var(--rd-sidebar-fg)' }}
                      />
                      <span className="truncate">{spec?.info?.title ?? appConfig.defaultTitle}</span>
                    </div>
                    <Drawer
                      open={drawerOpen}
                      onClose={() => setDrawerOpen(false)}
                      placement="left"
                      width="85vw"
                      closable={false}
                      styles={{ body: { padding: 0, background: 'var(--rd-sidebar-bg)' } }}
                    >
                      {navbar}
                    </Drawer>
                    <div className="flex-1 overflow-y-auto rd-scroll px-1">{content}</div>
                  </div> : <Splitter onResizeEnd={(sizes) => setNavbarSize(sizes[0] / window.innerWidth)}>
                    <Splitter.Panel collapsible defaultSize={`${Math.round(100 * navbarSize)}%`} max='50%' min='10%' style={{ padding: 0 }}>
                      {navbar}
                    </Splitter.Panel>
                    <Splitter.Panel className="h-screen overflow-y-auto rd-scroll ml-2">
                      {content}
                    </Splitter.Panel>
                  </Splitter>}
                </Router>
              </AntdConfigProvider>
            </ExtensionsContext.Provider>
          </ConfigContext.Provider>
        </UserConfigContext.Provider>
      </SpecContext.Provider>
    </ModalContext.Provider >
  )
}

type SpecPlaceholderProps = {
  loading: boolean;
  error?: string;
  onLoad: () => void;
  securityRequirement?: ReactNode;
}

// Shown until a spec is available, either loading, asking for credentials or reporting an error
function SpecPlaceholder({ loading, error, onLoad, securityRequirement }: SpecPlaceholderProps) {
  if (loading) {
    return (<div className="flex justify-center items-center flex-col min-h-screen gap-3">
      <Spin size="large" />
      <h2 className="text-xl">Loading specification...</h2>
    </div>)
  }

  return (
    <div className="flex justify-center items-center flex-col min-h-screen gap-3 p-4">
      {securityRequirement && <div className="w-full max-w-lg">
        <h1 className="text-xl mb-2 text-center">Credentials are required to access the OpenAPI specification</h1>
        {securityRequirement}
      </div>}
      {error && <Alert className="w-full max-w-lg" type="error" showIcon message="Could not load the specification" description={error} />}
      <Button type="primary" onClick={onLoad}>Load OpenAPI</Button>
    </div>
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
