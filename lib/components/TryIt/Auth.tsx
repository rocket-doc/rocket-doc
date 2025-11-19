import { AuthInformations, getSavedCredential, InitialCredentials, ProfileStore, SavedCredentials, updateAuthValueFromSchemeValue } from "@/components/SecurityRequirement/schemes";
import SecurityRequirement from "@/components/SecurityRequirement/SecurityRequirement";
import usePersistentState from "@/lib/hooks/persistant";
import { profilesKey, specificationCredentialsDefaultSchemeName, specificationCredentialsKey, tryItCredentialsKey } from "@/lib/local_storage";
import { Operation } from "@/lib/operations";
import { GetRef } from "@/lib/ref";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { Button, Collapse, Input, Modal, Select } from "antd";

import { OpenAPIObject, SecurityRequirementObject, SecuritySchemeObject } from "openapi3-ts/oas31";
import { useEffect, useState } from "react";



type TryItAuthProps = {
  operation: Operation;
  spec: OpenAPIObject | null;
  setAuth: (auth: AuthInformations | null) => void;
}

export function TryIt_Auth({ operation, spec, setAuth: setParentAuth }: TryItAuthProps) {
  const [profileStore, setProfileStore] = usePersistentState<ProfileStore>(profilesKey, {
    profiles: {
      "Default": {
        name: "Default",
        credentials: JSON.parse(localStorage.getItem(tryItCredentialsKey) || "{}")
      }
    },
    currentProfileId: "Default"
  });

  const [authInformationsValue, setAuthInformationsValue] = useState<AuthInformations>({});
  const [schemes, setSchemes] = useState<Record<string, SecuritySchemeObject>>({});
  const [requirements, setRequirements] = useState<SecurityRequirementObject[]>([]);

  const [requirement, setRequirement] = useState<SecurityRequirementObject | null>(null)

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");

  const currentProfile = profileStore.profiles[profileStore.currentProfileId];
  const savedCreds = currentProfile?.credentials || {};

  const setSavedCreds = (newCreds: SavedCredentials | ((prev: SavedCredentials) => SavedCredentials)) => {
    setProfileStore((prev) => {
      const currentCreds = prev.profiles[prev.currentProfileId].credentials;
      const updatedCreds = typeof newCreds === 'function' ? newCreds(currentCreds) : newCreds;

      return {
        ...prev,
        profiles: {
          ...prev.profiles,
          [prev.currentProfileId]: {
            ...prev.profiles[prev.currentProfileId],
            credentials: updatedCreds
          }
        }
      };
    });
  };

  const handleAddProfile = () => {
    if (!newProfileName) return;
    setProfileStore(prev => ({
      ...prev,
      profiles: {
        ...prev.profiles,
        [newProfileName]: {
          name: newProfileName,
          credentials: {}
        }
      },
      currentProfileId: newProfileName
    }));
    setNewProfileName("");
    setIsModalOpen(false);
  };

  const handleDeleteProfile = () => {
    setProfileStore(prev => {
      const newProfiles = { ...prev.profiles };
      delete newProfiles[prev.currentProfileId];
      const newId = Object.keys(newProfiles)[0];
      return {
        profiles: newProfiles,
        currentProfileId: newId
      };
    });
  };

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
    <>
      <Collapse
        items={[{
          label: "Security",
          forceRender: true,
          children: (<>
            <div className="mb-4 flex items-center gap-2">
              <Select
                className="flex-1"
                value={profileStore.currentProfileId}
                onChange={(v) => setProfileStore(prev => ({ ...prev, currentProfileId: v }))}
                options={Object.values(profileStore.profiles).map(p => ({ label: p.name, value: p.name }))}
              />
              <Button icon={<IconPlus size={16} />} onClick={() => setIsModalOpen(true)} />
              <Button
                icon={<IconTrash size={16} />}
                danger
                disabled={Object.keys(profileStore.profiles).length <= 1}
                onClick={handleDeleteProfile}
              />
            </div>

            {requirements && requirements.length > 1 && <Select
              options={requirements.map((requirement, i) => ({
                label: Object.keys(requirement).join(" and "),
                value: i,
              }))}
              defaultValue={0}
              onChange={(v) => setRequirement(requirements[v])}
              className="mb-2 w-full"
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
      <Modal
        title="Create New Profile"
        open={isModalOpen}
        onOk={handleAddProfile}
        onCancel={() => setIsModalOpen(false)}
      >
        <Input
          placeholder="Profile Name"
          value={newProfileName}
          onChange={e => setNewProfileName(e.target.value)}
          onPressEnter={handleAddProfile}
        />
      </Modal>
    </>
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
