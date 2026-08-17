import { CredentialProfiles } from "@/lib/hooks/credentials";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { Button, Input, Modal, Select, Tooltip } from "antd";
import { useState } from "react";

type ProfilesProps = {
  credentials: CredentialProfiles;
}

// Lets the user pick, create and delete the credential profile used to fill security schemes
export function Profiles({ credentials }: ProfilesProps) {
  const { profiles, currentProfileId, selectProfile, addProfile, deleteProfile } = credentials;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");

  const submitNewProfile = () => {
    if (!newProfileName) return;
    addProfile(newProfileName);
    setNewProfileName("");
    setIsModalOpen(false);
  };

  return (<>
    <div className="mb-4 flex items-center gap-2">
      <Select
        className="flex-1"
        value={currentProfileId}
        onChange={selectProfile}
        options={profiles.map((profile) => ({ label: profile.name, value: profile.name }))}
      />
      <Tooltip title="Add a credentials profile">
        <Button icon={<IconPlus size={16} />} onClick={() => setIsModalOpen(true)} />
      </Tooltip>
      <Tooltip title="Delete the current credentials profile">
        <Button
          icon={<IconTrash size={16} />}
          danger
          disabled={profiles.length <= 1}
          onClick={deleteProfile}
        />
      </Tooltip>
    </div>
    <Modal
      title="Create New Profile"
      open={isModalOpen}
      onOk={submitNewProfile}
      onCancel={() => setIsModalOpen(false)}
    >
      <Input
        placeholder="Profile Name"
        value={newProfileName}
        onChange={(e) => setNewProfileName(e.target.value)}
        onPressEnter={submitNewProfile}
      />
    </Modal>
  </>)
}
