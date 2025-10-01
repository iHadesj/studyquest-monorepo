// src/components/ModalUserPerfil/index.tsx
import { useState, useMemo, useEffect, useRef } from 'react';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { db, storage, auth } from '../../config/firebase';
import {
  Trophy,
  UserPlus,
  Check,
  X,
  Star,
  Swatches,
  Crown,
  PencilSimple,
} from 'phosphor-react';
import * as Modal from '../Modal';
import { useFriendship } from '../../hooks/useFriendship';
import type { UserProfileData } from '../../interfaces';
import * as S from './style';
import styled from 'styled-components';
import { useProgressStore } from '../../hooks/useProgressStore';
import { verificarEdesbloquearConquistas } from '../../services/achievements';

const ButtonGroup = styled(motion.div)`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
  min-height: 38px;
  width: 100%;
`;

const ActionButton = styled.button<{
  variant?: 'primary' | 'success' | 'danger';
}>`
  background-color: ${({ variant }) =>
    variant === 'success'
      ? '#43b581'
      : variant === 'danger'
      ? '#ed4245'
      : '#5865f2'};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-family: 'Fira Code', monospace;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: bold;
  transition: background-color 0.2s;
  flex: 1;
  justify-content: center;

  &:hover:not(:disabled) {
    filter: brightness(1.1);
  }
  &:disabled {
    background-color: #40444b;
    cursor: not-allowed;
  }
`;

const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      delayChildren: 0.2,
      staggerChildren: 0.1,
    },
  },
};

const contentVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};

interface ModalUserPerfilProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToAchievements: () => void;
  user: UserProfileData | null;
}

function generateAvatarSeeds(count = 120) {
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

export function ModalUserPerfil({
  isOpen,
  onClose,
  onNavigateToAchievements,
  user,
}: ModalUserPerfilProps) {
  // 1. TODOS os hooks são declarados aqui no topo, incondicionalmente.
  const [isEditing, setIsEditing] = useState(false);
  const [editedUsername, setEditedUsername] = useState('');
  const [editedBio, setEditedBio] = useState('');
  const [editedAvatarFile, setEditedAvatarFile] = useState<File | null>(null);
  const [editedAvatarPreview, setEditedAvatarPreview] = useState<string | null>(
    null
  );
  const [editedAvatarSeed, setEditedAvatarSeed] = useState('');

  const { friendshipStatus, sendRequest, cancelRequest, handleRequest } =
    useFriendship(user?.uid || null);
  const hydrate = useProgressStore((state) => state.hydrateFromFirestore);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarSeeds = useMemo(() => generateAvatarSeeds(120), []);

  // O useEffect também é um hook e deve ser chamado incondicionalmente.
  useEffect(() => {
    if (user) {
      setEditedUsername(user.username || '');
      setEditedBio(user.bio || '');
      setEditedAvatarSeed(user.avatarSeed || avatarSeeds[0]);
      setEditedAvatarPreview(null);
      setEditedAvatarFile(null);
    }
  }, [user, isEditing, avatarSeeds]);

  const completedTasks = useMemo(() => {
    if (!user?.progress) return 0;
    return Object.values(user.progress)
      .flatMap((subject: any) => Object.values(subject))
      .filter((level: any) => level.concluido).length;
  }, [user?.progress]);

  const avatarSrc = useMemo(() => {
    if (editedAvatarPreview) return editedAvatarPreview;
    if (isEditing) {
      return editedAvatarSeed
        ? `https://api.dicebear.com/8.x/pixel-art/svg?seed=${encodeURIComponent(
            editedAvatarSeed
          )}`
        : user?.customAvatarUrl ||
            `https://api.dicebear.com/8.x/pixel-art/svg?seed=${encodeURIComponent(
              user?.avatarSeed || avatarSeeds[0]
            )}`;
    }
    return (
      user?.customAvatarUrl ||
      `https://api.dicebear.com/8.x/pixel-art/svg?seed=${encodeURIComponent(
        user?.avatarSeed || avatarSeeds[0]
      )}`
    );
  }, [editedAvatarPreview, isEditing, editedAvatarSeed, user, avatarSeeds]);

  // 2. AGORA, depois que todos os hooks foram chamados, fazemos a verificação.
  if (!user) {
    return null;
  }

  // O resto da lógica do componente continua aqui...
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setEditedAvatarFile(file);
      setEditedAvatarPreview(URL.createObjectURL(file));
      setEditedAvatarSeed('');
    }
  };

  const handleSave = async () => {
    const currentUser = auth.currentUser;
    if (!user || !currentUser || currentUser.uid !== user.uid) return;

    const userDocRef = doc(db, 'users', user.uid);
    const updateData: { [key: string]: any } = {};
    let hasChanges = false;

    if (editedAvatarFile) {
      const storageRef = ref(storage, `avatars/${user.uid}`);
      const snapshot = await uploadBytes(storageRef, editedAvatarFile);
      const customAvatarUrl = await getDownloadURL(snapshot.ref);
      if (customAvatarUrl !== user.customAvatarUrl) {
        updateData.customAvatarUrl = customAvatarUrl;
        updateData.avatarSeed = '';
        hasChanges = true;
      }
    } else if (editedAvatarSeed !== user.avatarSeed) {
      updateData.avatarSeed = editedAvatarSeed;
      updateData.customAvatarUrl = '';
      hasChanges = true;
    }

    if (editedUsername.trim() !== user.username) {
      updateData.username = editedUsername.trim();
      hasChanges = true;
    }
    if (editedBio.trim() !== (user.bio || '')) {
      updateData.bio = editedBio.trim();
      hasChanges = true;
    }

    if (hasChanges) {
      await updateDoc(userDocRef, updateData);
      verificarEdesbloquearConquistas('EDITOU_PERFIL');
      hydrate({ ...user, ...updateData });
    }
    setIsEditing(false);
  };

  const handleCancel = () => setIsEditing(false);

  const isMyProfile = friendshipStatus === 'MYSELF';
  const unlockedAchievementsCount = user.unlockedAchievements?.length || 0;

  const renderFriendshipButton = () => {
    switch (friendshipStatus) {
      case 'FRIENDS':
        return <ActionButton disabled>Amigos</ActionButton>;
      case 'SENT':
        return (
          <ActionButton variant="danger" onClick={cancelRequest}>
            Cancelar Pedido
          </ActionButton>
        );
      case 'RECEIVED':
        return (
          <>
            <ActionButton variant="success" onClick={() => handleRequest(true)}>
              <Check /> Aceitar
            </ActionButton>
            <ActionButton variant="danger" onClick={() => handleRequest(false)}>
              <X /> Recusar
            </ActionButton>
          </>
        );
      case 'NONE':
        return (
          <ActionButton onClick={sendRequest}>
            <UserPlus /> Adicionar Amigo
          </ActionButton>
        );
      default:
        return null;
    }
  };

  // O JSX do retorno permanece o mesmo.
  return (
    <Modal.Root isOpen={isOpen} onClose={onClose}>
      <Modal.Overlay />
      <Modal.Content
        style={{
          padding: 0,
          backgroundColor: 'transparent',
          boxShadow: 'none',
        }}
      >
        <S.ProfileCard
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <S.CloseButton
            onClick={isEditing ? handleCancel : onClose}
            aria-label="Fechar"
          >
            <X size={20} />
          </S.CloseButton>
          <S.ProfileHeader />

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />

          <S.AvatarContainer
            onClick={() =>
              isEditing && isMyProfile && fileInputRef.current?.click()
            }
          >
            <S.ProfileAvatar src={avatarSrc} alt="User Avatar" />
            {isEditing && isMyProfile && (
              <S.EditOverlay>
                <PencilSimple size={32} />
              </S.EditOverlay>
            )}
          </S.AvatarContainer>

          <S.ProfileBody>
            <S.UserInfo>
              <AnimatePresence mode="wait">
                {isEditing && isMyProfile ? (
                  <S.UsernameInput
                    key="input-username"
                    value={editedUsername}
                    onChange={(e) => setEditedUsername(e.target.value)}
                    maxLength={15}
                  />
                ) : (
                  <S.Username
                    as={motion.h3}
                    key="text-username"
                    variants={contentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    {user.username}
                  </S.Username>
                )}
              </AnimatePresence>
              {user.fullTag && <S.UserTag>{user.fullTag}</S.UserTag>}
            </S.UserInfo>

            <AnimatePresence mode="wait">
              {isEditing && isMyProfile ? (
                <S.EditForm
                  key="edit-form"
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <S.BioTextarea
                    placeholder="Escreva algo sobre você..."
                    value={editedBio}
                    onChange={(e) => setEditedBio(e.target.value)}
                    maxLength={150}
                  />
                  <h4 style={{ margin: '0.5rem 0 0.5rem 0', color: '#dcddde' }}>
                    Escolha um avatar pixel-art:
                  </h4>
                  <S.AvatarGrid>
                    {avatarSeeds.map((seed) => (
                      <S.AvatarOption
                        key={seed}
                        $isSelected={editedAvatarSeed === seed}
                        onClick={() => {
                          setEditedAvatarSeed(seed);
                          setEditedAvatarFile(null);
                          setEditedAvatarPreview(null);
                        }}
                      >
                        <img
                          src={`https://api.dicebear.com/8.x/pixel-art/svg?seed=${encodeURIComponent(
                            seed
                          )}`}
                          alt={`Avatar ${seed}`}
                          loading="lazy"
                        />
                      </S.AvatarOption>
                    ))}
                  </S.AvatarGrid>
                </S.EditForm>
              ) : (
                <motion.div
                  key="view-content"
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  style={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  {user.bio && <S.BioText>{user.bio}</S.BioText>}
                  <S.StatsContainer>
                    <S.StatBox>
                      <S.StatIcon>
                        <Star size={24} />
                      </S.StatIcon>
                      <S.StatInfo>
                        <S.StatValue>
                          {user.xp.toLocaleString('pt-BR')}
                        </S.StatValue>
                        <S.StatLabel>Total XP</S.StatLabel>
                      </S.StatInfo>
                    </S.StatBox>
                    <S.StatBox>
                      <S.StatIcon>
                        <Trophy size={24} />
                      </S.StatIcon>
                      <S.StatInfo>
                        <S.StatValue>{unlockedAchievementsCount}</S.StatValue>
                        <S.StatLabel>Conquistas</S.StatLabel>
                      </S.StatInfo>
                    </S.StatBox>
                    <S.StatBox>
                      <S.StatIcon>
                        <Swatches size={24} />
                      </S.StatIcon>
                      <S.StatInfo>
                        <S.StatValue>{completedTasks}</S.StatValue>
                        <S.StatLabel>Fases Concluídas</S.StatLabel>
                      </S.StatInfo>
                    </S.StatBox>
                    {user.rank && (
                      <S.StatBox>
                        <S.StatIcon>
                          <Crown size={24} />
                        </S.StatIcon>
                        <S.StatInfo>
                          <S.StatValue>#{user.rank}</S.StatValue>
                          <S.StatLabel>Ranking</S.StatLabel>
                        </S.StatInfo>
                      </S.StatBox>
                    )}
                  </S.StatsContainer>
                </motion.div>
              )}
            </AnimatePresence>

            <ButtonGroup>
              {isMyProfile ? (
                isEditing ? (
                  <>
                    <ActionButton variant="success" onClick={handleSave}>
                      <Check /> Salvar
                    </ActionButton>
                    <ActionButton variant="danger" onClick={handleCancel}>
                      <X /> Cancelar
                    </ActionButton>
                  </>
                ) : (
                  <>
                    <ActionButton onClick={() => setIsEditing(true)}>
                      Editar Perfil
                    </ActionButton>
                    <ActionButton onClick={onNavigateToAchievements}>
                      <Trophy /> Conquistas
                    </ActionButton>
                  </>
                )
              ) : (
                renderFriendshipButton()
              )}
            </ButtonGroup>
          </S.ProfileBody>
        </S.ProfileCard>
      </Modal.Content>
    </Modal.Root>
  );
}
