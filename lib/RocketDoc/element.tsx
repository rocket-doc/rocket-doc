import { Extensions } from "@/lib/config";
import { FC, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import RocketDoc, { AppProps } from "./RocketDoc";

export function MountRocketDoc(rocketDoc: Element) {
  createRoot(rocketDoc).render(
    <ReactiveRocketDoc element={rocketDoc} />
  );
}

function parseJSONBestEffort<T>(json: string | null): T | undefined {
  if (!json) return undefined;

  try {
    return JSON.parse(json) as T;
  } catch (e) {
    console.error("Failed to parse JSON", e);
    return undefined;
  }
}

function rocketPropsFromElement(rocketDoc: Element): AppProps {
  return {
    showFileImport: !rocketDoc.hasAttribute("hide-file-import"),
    logo: rocketDoc.getAttribute("logo") ?? undefined,
    specUrl: rocketDoc.getAttribute("spec-url") ?? undefined,
    specRequiredSecurity: parseJSONBestEffort(rocketDoc.getAttribute("spec-required-security")),
    specRequiredSecurityScopes: rocketDoc.getAttribute("spec-required-security-scopes")?.split(",") ?? undefined,
    config: parseJSONBestEffort(rocketDoc.getAttribute("config")),
    extensions: {
      fieldDetails: fieldDetailsExtension(rocketDoc.getAttribute("extensions-field-details")),
    }
  };
}

// Extensions are exposed by the host page as global variables
function fieldDetailsExtension(globalName: string | null): Extensions['fieldDetails'] {
  if (!globalName) return undefined;
  const extension = (window as unknown as Record<string, unknown>)[globalName];
  return typeof extension === 'function' ? (extension as Extensions['fieldDetails']) : undefined;
}

type ReactiveRocketDocProps = {
  element: Element;
};

// Component that will re-render RocketDoc when the element's attributes change
// allows for dynamic configuration of RocketDoc in the DOM without wrapping the RocketDoc component in another React component
const ReactiveRocketDoc: FC<ReactiveRocketDocProps> = ({ element }) => {
  const [rocketProps, setRocketProps] = useState<AppProps>(rocketPropsFromElement(element));

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setRocketProps(rocketPropsFromElement(element));
    })

    observer.observe(element, { attributes: true });
    return () => observer.disconnect();
  }, [element])

  return <RocketDoc
    {...rocketProps}
  />;

}

declare global {
  interface Window {
    MountRocketDoc: (e: Element) => void;
  }
}

window.MountRocketDoc = MountRocketDoc;
