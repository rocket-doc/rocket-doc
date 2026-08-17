import { Profiles } from "@/components/SecurityRequirement/Profiles";
import { AuthInformations, getSavedCredential, updateAuthValueFromSchemeValue } from "@/components/SecurityRequirement/schemes";
import SecurityRequirement from "@/components/SecurityRequirement/SecurityRequirement";
import { getInitialAuthValuesCredentials, useCredentialProfiles } from "@/lib/hooks/credentials";
import { Operation } from "@/lib/operations";
import { ResolveSecuritySchemes } from "@/lib/security";
import { Collapse, Select } from "antd";
import { OpenAPIObject, SecurityRequirementObject } from "openapi3-ts/oas31";
import { useEffect, useMemo, useState } from "react";

type TryItAuthProps = {
  operation: Operation;
  spec: OpenAPIObject | null;
  setAuth: (auth: AuthInformations | null) => void;
}

export function TryIt_Auth({ operation, spec, setAuth: setParentAuth }: TryItAuthProps) {
  const credentials = useCredentialProfiles();
  const { savedCreds, setSavedCreds } = credentials;

  const schemes = useMemo(() => ResolveSecuritySchemes(spec), [spec]);
  // Security defined on the operation replaces the one defined at the spec level
  const requirements = useMemo<SecurityRequirementObject[]>(
    () => operation.security ?? spec?.security ?? [],
    [operation, spec]
  );

  const [requirementIndex, setRequirementIndex] = useState(0);
  useEffect(() => setRequirementIndex(0), [requirements]);

  const requirement = requirements[requirementIndex] ?? null;

  const authInformations = useMemo<AuthInformations>(() => {
    if (!requirement) return {};
    return Object.keys(requirement).reduce<AuthInformations>(
      (auth, schemeName) => schemes[schemeName]
        ? updateAuthValueFromSchemeValue(schemeName, schemes[schemeName], getSavedCredential(schemeName, schemes[schemeName], savedCreds), auth)
        : auth,
      {}
    );
  }, [requirement, schemes, savedCreds]);

  useEffect(() => {
    setParentAuth(authInformations);
  }, [authInformations, setParentAuth]);

  if (!requirement) return null;
  return (
    <Collapse
      items={[{
        label: "Security",
        key: "security",
        forceRender: true,
        children: (<>
          <Profiles credentials={credentials} />
          {requirements.length > 1 && <Select
            options={requirements.map((requirement, i) => ({
              label: Object.keys(requirement).join(" and ") || "No security",
              value: i,
            }))}
            value={requirementIndex}
            onChange={setRequirementIndex}
            className="mb-2 w-full"
          />}
          <SecurityRequirement
            schemes={schemes}
            requirement={requirement}
            savedCreds={savedCreds}
            setSavedCreds={setSavedCreds}
            initialValues={getInitialAuthValuesCredentials()}
          />
        </>)
      }]}
    />
  )
}
