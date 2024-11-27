import { AuthInformations, getSavedCredential, InitialCredentials, SavedCredentials, updateAuthValueFromSchemeValue } from "@/components/SecurityRequirement/schemes";
import SecurityRequirement from "@/components/SecurityRequirement/SecurityRequirement";
import usePersistentState from "@/lib/hooks/persistant";
import { specificationCredentialsDefaultSchemeName, specificationCredentialsKey, tryItCredentialsKey } from "@/lib/local_storage";
import { Operation } from "@/lib/operations";
import { GetRef } from "@/lib/ref";
import { Collapse, Select } from "antd";
import { OpenAPIObject, SecurityRequirementObject, SecuritySchemeObject } from "openapi3-ts/oas31";
import { useEffect, useState } from "react";



type TryItAuthProps = {
  operation: Operation;
  spec: OpenAPIObject | null;
  setAuth: (auth: AuthInformations | null) => void;
}

export function TryIt_Auth({ operation, spec, setAuth: setParentAuth }: TryItAuthProps) {
  const [savedCreds, setSavedCreds] = usePersistentState<SavedCredentials>(tryItCredentialsKey, {});
  const [authInformationsValue, setAuthInformationsValue] = useState<AuthInformations>({});
  const [schemes, setSchemes] = useState<Record<string, SecuritySchemeObject>>({});
  const [requirements, setRequirements] = useState<SecurityRequirementObject[]>([]);

  const [requirement, setRequirement] = useState<SecurityRequirementObject | null>(null)

  useEffect(() => {
    setParentAuth(authInformationsValue);
  }, [authInformationsValue]);

  useEffect(() => {
    if (!requirement) {
      setAuthInformationsValue({});
      return;
    }
    let authCredentials: AuthInformations = {};
    Object.entries(requirement).map(([scheme, _]) => {
      authCredentials = updateAuthValueFromSchemeValue(scheme, schemes[scheme], getSavedCredential(scheme, schemes[scheme], savedCreds), authCredentials);
    })

    setAuthInformationsValue(authCredentials);

  }, [savedCreds, requirement])

  useEffect(() => {
    if (!operation || !spec) return;
    const schemes = Object.fromEntries(
      Object.entries(spec.components?.securitySchemes ?? {})
        .map(([key, value]) => [key, GetRef(value, spec)[0]])
    );
    const requirements = operation.security ?? spec.security ?? [];
    const requirement = requirements[0] ?? null;

    setSchemes(schemes);
    setRequirements(requirements);
    setRequirement(requirement);
  }, [operation, spec]);

  if (!requirement) return null;
  return (
    <Collapse
      items={[{
        label: "Security",
        forceRender: true,
        children: (<>
          {requirements && requirements.length > 1 && <Select
            options={requirements.map((requirement, i) => ({
              label: Object.keys(requirement).join(" and "),
              value: i,
            }))}
            defaultValue={0}
            onChange={(v) => setRequirement(requirements[v])}
            className="mb-2"
          />}
          <div>
            <SecurityRequirement
              schemes={schemes}
              requirement={requirement}
              savedCreds={savedCreds}
              setSavedCreds={setSavedCreds}
              initialValues={getInitialAuthValuesCredentials()}
            />
          </div></>)
      }]}
    />
  )
}

// Loads values used for loading the specification file
// and uses them as default values for the authentification
function getInitialAuthValuesCredentials(): InitialCredentials | undefined {
  let rawValue = localStorage.getItem(specificationCredentialsKey);
  if (!rawValue) return undefined;

  try {
    const specificationCredentialsValues = JSON.parse(rawValue) as SavedCredentials;
    return Object.fromEntries(
      Object.entries(specificationCredentialsValues)
        .map(([key, value]) => {
          if (value?.[specificationCredentialsDefaultSchemeName]) {
            return [key, value[specificationCredentialsDefaultSchemeName]];
          }
          return undefined;
        }).filter((v) => v !== undefined))
  } catch (e) {
    console.error("Error while parsing specification credentials", e);
    return undefined;
  }
}
