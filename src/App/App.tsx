import Navbar from "../components/Navbar/Navbar";
import rocketLogo from "../assets/rocket-doc.png";
import { ConfigContext, SpecContext } from "../lib/context";
import { AppConfig, DefaultConfig } from "../lib/config";
import { useState } from "react";
import { OpenAPIObject } from "openapi3-ts/oas31";
import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";
import { Home } from "../components/Home/Home";
import { Operation } from "../components/Operation/Operation";

type AppProps = {
  config?: AppConfig;
};

export default function App({ config }: AppProps) {
  const [spec, setSpec] = useState<OpenAPIObject | null>(null);
  const [navbarSize, setNavbarSize] = useState(0);

  return (
    <SpecContext.Provider value={{ spec, setSpec }}>
      <ConfigContext.Provider value={config ?? DefaultConfig}>
        <BrowserRouter>
          <div className="flex">
            <Navbar
              logo={rocketLogo}
              showSpecFileLoader
              setNavbarSize={setNavbarSize}
            />
            <div className="flex-1 p-4" style={{
              marginLeft: navbarSize,
            }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route
                  path="/operations/:method/:path"
                  Component={Operation}
                  loader={({ params }) => ({ method: params.method, path: params.path })}
                />
              </Routes>
            </div>
          </div>
        </BrowserRouter>
      </ConfigContext.Provider>
    </SpecContext.Provider>
  )
}
