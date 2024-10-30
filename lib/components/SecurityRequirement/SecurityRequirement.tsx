import { Input, Table } from "antd";
import { SecurityRequirementObject, SecuritySchemeObject } from "openapi3-ts/oas31";
import { addValueToSavedCreds, getSavedCredential, SavedCredentials } from "./schemes";

type SecurityRequirementProps = {
  requirement: SecurityRequirementObject;
  schemes: {
    [k: string]: SecuritySchemeObject;
  },
  savedCreds: SavedCredentials;
  setSavedCreds: (c: SavedCredentials) => void
  typeAsName?: boolean
}

export type ParsedScheme = { scheme: SecuritySchemeObject, scopes: string[], schemeName: string }

export default function SecurityRequirement({ requirement, schemes, savedCreds, setSavedCreds, typeAsName }: SecurityRequirementProps) {
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
        render: ({ scheme, schemeName }: ParsedScheme) => <Input
          type="text"
          placeholder={scheme.name ?? schemeName}
          value={getSavedCredential(schemeName, scheme, savedCreds)}
          onChange={(e) => setSavedCreds(addValueToSavedCreds(schemeName, scheme, e.target.value, savedCreds))}
        />
      }
    ]}
  />)
}
