import {
  InitialCredentials,
  Profile,
  ProfileStore,
  SavedCredentials,
} from '@/components/SecurityRequirement/schemes';
import usePersistentState from '@/lib/hooks/persistant';
import {
  profilesKey,
  specificationCredentialsDefaultSchemeName,
  specificationCredentialsKey,
  tryItCredentialsKey,
} from '@/lib/local_storage';
import { useCallback } from 'react';

export const defaultProfileName = 'Default';

function parseStoredCredentials(rawValue: string | null): SavedCredentials {
  if (!rawValue) return {};
  try {
    return JSON.parse(rawValue) as SavedCredentials;
  } catch (e) {
    console.error('Error while parsing stored credentials', e);
    return {};
  }
}

function initialProfileStore(): ProfileStore {
  return {
    profiles: {
      [defaultProfileName]: {
        name: defaultProfileName,
        // Credentials used to be stored outside of a profile, they are kept as the default profile
        credentials: parseStoredCredentials(localStorage.getItem(tryItCredentialsKey)),
      },
    },
    currentProfileId: defaultProfileName,
  };
}

export type CredentialProfiles = {
  profiles: Profile[];
  currentProfileId: string;
  savedCreds: SavedCredentials;
  selectProfile: (id: string) => void;
  addProfile: (name: string) => void;
  deleteProfile: () => void;
  setSavedCreds: (creds: SavedCredentials | ((previous: SavedCredentials) => SavedCredentials)) => void;
};

// Credentials are stored in local storage, grouped in named profiles so that
// several sets of credentials can be kept side by side (eg. per environment)
export function useCredentialProfiles(): CredentialProfiles {
  const [profileStore, setProfileStore] = usePersistentState<ProfileStore>(profilesKey, initialProfileStore());

  const setSavedCreds = useCallback(
    (newCreds: SavedCredentials | ((previous: SavedCredentials) => SavedCredentials)) => {
      setProfileStore((previous) => {
        const currentCreds = previous.profiles[previous.currentProfileId]?.credentials ?? {};
        return {
          ...previous,
          profiles: {
            ...previous.profiles,
            [previous.currentProfileId]: {
              ...previous.profiles[previous.currentProfileId],
              name: previous.profiles[previous.currentProfileId]?.name ?? previous.currentProfileId,
              credentials: typeof newCreds === 'function' ? newCreds(currentCreds) : newCreds,
            },
          },
        };
      });
    },
    [setProfileStore]
  );

  const selectProfile = useCallback(
    (id: string) => setProfileStore((previous) => ({ ...previous, currentProfileId: id })),
    [setProfileStore]
  );

  const addProfile = useCallback(
    (name: string) => {
      if (!name) return;
      setProfileStore((previous) => ({
        ...previous,
        profiles: { ...previous.profiles, [name]: { name, credentials: {} } },
        currentProfileId: name,
      }));
    },
    [setProfileStore]
  );

  const deleteProfile = useCallback(() => {
    setProfileStore((previous) => {
      const profiles = { ...previous.profiles };
      delete profiles[previous.currentProfileId];
      return { profiles, currentProfileId: Object.keys(profiles)[0] };
    });
  }, [setProfileStore]);

  return {
    profiles: Object.values(profileStore.profiles),
    currentProfileId: profileStore.currentProfileId,
    savedCreds: profileStore.profiles[profileStore.currentProfileId]?.credentials ?? {},
    selectProfile,
    addProfile,
    deleteProfile,
    setSavedCreds,
  };
}

// Loads the values used to fetch the specification file, they are used as
// default values for the credentials of the documented API
export function getInitialAuthValuesCredentials(): InitialCredentials | undefined {
  const rawValue = localStorage.getItem(specificationCredentialsKey);
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
        })
        .filter((value): value is [string, string] => value !== undefined)
    );
  } catch (e) {
    console.error('Error while parsing specification credentials', e);
    return undefined;
  }
}
