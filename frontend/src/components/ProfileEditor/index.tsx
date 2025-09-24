import { useState, useEffect, useMemo } from 'react';
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

function generateAvatarSeeds(count = 240) {
  const ADJS = [
    'pixel',
    'neon',
    'astro',
    'bravo',
    'doce',
    'rápido',
    'lento',
    'forte',
    'mágico',
    'ninja',
    'sábio',
    'solar',
    'lunar',
    'vapor',
    'rúnico',
    'neo',
    'zulu',
    'crystal',
    'frost',
    'ember',
    'shadow',
    'glimmer',
    'tiny',
    'bold',
  ];
  const NOUNS = [
    'gato',
    'lobo',
    'draco',
    'byte',
    'fênix',
    'cacto',
    'raposa',
    'orca',
    'panda',
    'urso',
    'leão',
    'zebra',
    'pixel',
    'robo',
    'gnomo',
    'orca',
    'orca2',
    'mar',
    'planeta',
    'estrela',
    'meteor',
    'cubo',
    'ovo',
    'rato',
  ];

  const seeds: string[] = [];

  for (let i = 0; i < count; i++) {
    const a = ADJS[i % ADJS.length];
    const n = NOUNS[Math.floor(i / ADJS.length) % NOUNS.length];
    seeds.push(`${a}-${n}-${i}`);
  }
  return seeds;
}

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

  const avatarSeeds = useMemo(() => generateAvatarSeeds(240), []);

  useEffect(() => {
    if (isOpen && !isSetupMode) {
      setUsername(currentUser.username || '');
      setSelectedAvatar(currentUser.avatarSeed || avatarSeeds[0]);
    } else if (isSetupMode) {
      setUsername('');
      setSelectedAvatar(avatarSeeds[0]);
    }
  }, [
    isOpen,
    isSetupMode,
    currentUser.username,
    currentUser.avatarSeed,
    avatarSeeds,
  ]);

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

  return (
    <Modal.Root isOpen={isOpen} onClose={onClose}>
      <Modal.Overlay />
      <Modal.Content>
        <EditorBox>
          <Modal.Close />
          <EditorTitle>Editar Perfil</EditorTitle>
          <EditorSubtitle>
            Personalize seu nome de usuário e avatar (pixel-art).
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
                  src={`https://api.dicebear.com/8.x/pixel-art/svg?seed=${encodeURIComponent(
                    seed
                  )}`}
                  alt={`Avatar ${seed}`}
                  loading="lazy"
                  decoding="async"
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
