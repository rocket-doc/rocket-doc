import { Table, Tooltip } from "antd";
import { SecurityRequirementObject, SecuritySchemeObject } from "openapi3-ts/oas31";
import { useEffect } from "react";
import { HiddenInput } from "./HiddenInput";
import { addValueToSavedCreds, getSavedCredential, InitialCredentials, SavedCredentials, schemeToCredentialType } from "./schemes";

type SecurityRequirementProps = {
  requirement: SecurityRequirementObject;
  schemes: {
    [k: string]: SecuritySchemeObject;
  },
  savedCreds: SavedCredentials;
  initialValues?: InitialCredentials
  setSavedCreds: (c: SavedCredentials) => void
  typeAsName?: boolean,
}

export type ParsedScheme = { scheme: SecuritySchemeObject, scopes: string[], schemeName: string }

export default function SecurityRequirement({ requirement, schemes, savedCreds, setSavedCreds, typeAsName, initialValues }: SecurityRequirementProps) {

  // If initial values are provided, we want to make sure that they are saved
  // in the savedCreds for any scheme that is not already saved
  useEffect(() => {
    if (!initialValues) return
    let newSavedCreds = { ...savedCreds }
    Object.keys(requirement).forEach((schemeName) => {
      const scheme = schemes[schemeName]
      if (!scheme) return
      const credsType = schemeToCredentialType(scheme)
      if (!credsType) return
      const initialValue = initialValues[credsType]
      if (!getSavedCredential(schemeName, scheme, savedCreds) && initialValue) {
        newSavedCreds = addValueToSavedCreds(schemeName, scheme, initialValue, newSavedCreds)
      }
    })

    setSavedCreds(newSavedCreds)
    // Initial values are only applied once, when the requirement is first rendered
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (<Table<ParsedScheme>
    pagination={false}
    dataSource={Object.entries(requirement)
      .filter(([scheme]) => schemes[scheme])
      .map(([scheme, scopes]) => ({ key: scheme, schemeName: scheme, scheme: schemes[scheme], scopes } as ParsedScheme))}
    columns={[
      {
        key: 'scheme',
        title: 'Scheme',
        render: ({ schemeName, scheme, scopes }: ParsedScheme) => (<span key={schemeName}>
          {typeAsName ? scheme.type : <>{schemeName}{scheme.name && ` (${scheme.name})`}</>}
          {scopes?.length > 0 && <Tooltip title={`Scopes: ${scopes.join(", ")}`}><small className="ml-1 opacity-60">{scopes.length} scope{scopes.length > 1 ? "s" : ""}</small></Tooltip>}
        </span>)
      },
      {
        key: 'value',
        title: 'Value',
        render: ({ scheme, schemeName }: ParsedScheme) => <HiddenInput
          key={schemeName}
          placeholder={scheme.name ?? schemeName}
          value={getSavedCredential(schemeName, scheme, savedCreds)}
          onChange={(e) => setSavedCreds(addValueToSavedCreds(schemeName, scheme, e.target.value, savedCreds))}
        />
      }
    ]}
  />)
}
