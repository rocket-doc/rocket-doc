import { Table } from "antd";
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
    Object.entries(requirement).forEach(([schemeName, _]) => {
      const scheme = schemes[schemeName]
      const credsType = schemeToCredentialType(scheme)
      if (!credsType) return
      if (!getSavedCredential(schemeName, scheme, savedCreds) && initialValues[credsType]) {
        newSavedCreds = addValueToSavedCreds(schemeName, scheme, initialValues[credsType], savedCreds)
      }
    })

    setSavedCreds(newSavedCreds)
  }, [])

  return (<Table<ParsedScheme>
    pagination={false}
    dataSource={Object.entries(requirement).map(([scheme, scopes]) => ({ key: schemes[scheme]?.name, schemeName: scheme, scheme: schemes[scheme], scopes } as ParsedScheme))}
    columns={[
      {
        key: 'scheme',
        title: 'Scheme',
        render: ({ schemeName, scheme }: ParsedScheme) => <span key={schemeName} >{typeAsName ? scheme.type : <>{schemeName}{scheme.name && ` (${scheme.name})`}</>}</span>
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
