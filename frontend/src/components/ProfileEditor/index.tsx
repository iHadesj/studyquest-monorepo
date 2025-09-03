import { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { useProgressStore } from '../../hooks/useProgressStore';
import * as Modal from '../Modal';
import {
  AvatarGrid,
  AvatarOption,
  EditorBox,
  EditorSubtitle,
  EditorTitle,
  SaveButton,
  UsernameInput,
} from './style';

const avatarSeeds = [
  'Max',
  'Bella',
  'Charlie',
  'Lucy',
  'Cooper',
  'Daisy',
  'Milo',
  'Sadie',
  'Rocky',
  'Zoe',
  'Bear',
  'Ruby',
  'Leo',
  'Cleo',
  'Oscar',
  'Penny',
  'Gizmo',
  'Loki',
  'Coco',
  'Simba',
  'Nala',
  'Ollie',
];

interface ProfileEditorProps {
  isOpen: boolean;
  onClose: () => void;
  isSetupMode?: boolean;
}

export function ProfileEditor({
  isOpen,
  onClose,
  isSetupMode = false,
}: ProfileEditorProps) {
  const currentUser = useProgressStore();
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');

  useEffect(() => {
    if (isOpen && !isSetupMode) {
      setUsername(currentUser.username || '');
      setSelectedAvatar(currentUser.avatarSeed || avatarSeeds[0]);
    } else if (isSetupMode) {
      setUsername('');
      setSelectedAvatar(avatarSeeds[0]);
    }
  }, [isOpen, isSetupMode, currentUser.username, currentUser.avatarSeed]);

  const handleSave = async () => {
    const user = auth.currentUser;
    if (user && username.trim()) {
      const userDocRef = doc(db, 'users', user.uid);
      try {
        await updateDoc(userDocRef, {
          username: username.trim(),
          avatarSeed: selectedAvatar,
        });
        onClose();
      } catch (error) {
        console.error('Erro ao atualizar o perfil:', error);
      }
    }
  };

  if (isSetupMode) {
    // Aqui você pode retornar a UI original do ProfileSetup,
    // mas usando os componentes e lógica deste editor.
    // Por simplicidade, vamos focar no modo de edição.
  }

  return (
    <Modal.Root isOpen={isOpen} onClose={onClose}>
      <Modal.Overlay />
      <Modal.Content>
        <EditorBox>
          <Modal.Close />
          <EditorTitle>Editar Perfil</EditorTitle>
          <EditorSubtitle>
            Personalize seu nome de usuário e avatar.
          </EditorSubtitle>

          <UsernameInput
            type="text"
            placeholder="Digite seu nome"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            maxLength={15}
          />

          <AvatarGrid>
            {avatarSeeds.map((seed) => (
              <AvatarOption
                key={seed}
                isSelected={selectedAvatar === seed}
                onClick={() => setSelectedAvatar(seed)}
                title={seed}
              >
                <img
                  src={`https://api.dicebear.com/8.x/pixel-art/svg?seed=${seed}`}
                  alt={`Avatar ${seed}`}
                />
              </AvatarOption>
            ))}
          </AvatarGrid>

          <SaveButton onClick={handleSave} disabled={!username.trim()}>
            Salvar Alterações
          </SaveButton>
        </EditorBox>
      </Modal.Content>
    </Modal.Root>
  );
}
