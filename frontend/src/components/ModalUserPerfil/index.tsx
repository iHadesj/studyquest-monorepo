import { useState, useMemo, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
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
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import * as Modal from '../Modal';
import { useFriendship } from '../../hooks/useFriendship';
import type { UserProfileData } from '../../interfaces';
import { useProgressStore } from '../../hooks/useProgressStore';
import { verificarEdesbloquearConquistas } from '../../services/achievements';
import * as S from './style';

function generateAvatarSeeds(count = 120) {
  const seeds: string[] = [];
  for (let i = 0; i < count; i++) {
    seeds.push(`avatar-${i}-${Math.random()}`);
  }
  return seeds;
}

const ButtonGroup = styled(motion.div)`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
  min-height: 38px;
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
  &:hover:not(:disabled) {
    filter: brightness(1.1);
  }
  &:disabled {
    background-color: #40444b;
    cursor: not-allowed;
  }
`;

const containerVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      delayChildren: 0.2,
      staggerChildren: 0.1,
    },
  },
  exit: { opacity: 0, scale: 0.95 },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

interface ModalUserPerfilProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToAchievements: () => void;
  user: UserProfileData | null;
}

export function ModalUserPerfil({
  isOpen,
  onClose,
  onNavigateToAchievements,
  user,
}: ModalUserPerfilProps) {
  const currentUserStore = useProgressStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isAvatarGridOpen, setIsAvatarGridOpen] = useState(false);

  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');

  const { friendshipStatus, sendRequest, cancelRequest, handleRequest } =
    useFriendship(user?.uid || null);

  const avatarSeeds = useMemo(() => generateAvatarSeeds(240), []);

  const resetFormState = () => {
    if (user) {
      setUsername(user.username || '');
      setBio(user.bio || '');
      setSelectedAvatar(user.avatarSeed || avatarSeeds[0]);
    }
  };

  useEffect(() => {
    if (!isEditing) {
      resetFormState();
    }
  }, [isEditing, resetFormState]);

  useEffect(() => {
    resetFormState();
    if (!isOpen) {
      setIsEditing(false);
      setIsAvatarGridOpen(false);
    }
  }, [user, isOpen]);

  const handleCancel = () => {
    setIsEditing(false);
    setIsAvatarGridOpen(false);
    resetFormState();
  };

  const completedTasks = useMemo(() => {
    if (!user?.progress) return 0;
    return Object.values(user.progress)
      .flatMap((subject: any) => Object.values(subject))
      .filter((level: any) => level.concluido).length;
  }, [user?.progress]);

  if (!user) return null;

  const isMyProfile = friendshipStatus === 'MYSELF';
  const unlockedAchievementsCount = user.unlockedAchievements?.length || 0;
  const devTag = 'Edu.dev#8636';
  const avatarSrc =
    user.fullTag === devTag
      ? '/Light.jpg'
      : `https://api.dicebear.com/8.x/pixel-art/svg?seed=${user.avatarSeed}`;

  const selectedAvatarSrc =
    user.fullTag === devTag
      ? '/Light.jpg'
      : `https://api.dicebear.com/8.x/pixel-art/svg?seed=${encodeURIComponent(
          selectedAvatar
        )}`;

  const handleAchievementsClick = () => {
    onNavigateToAchievements();
    onClose();
  };

  const handleSave = async () => {
    const firebaseUser = auth.currentUser;
    if (firebaseUser && username.trim()) {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      try {
        await updateDoc(userDocRef, {
          username: username.trim(),
          avatarSeed: selectedAvatar,
          bio: bio.trim(),
        });
        verificarEdesbloquearConquistas('EDITOU_PERFIL');
        currentUserStore.hydrateFromFirestore({
          ...currentUserStore,
          username: username.trim(),
          avatarSeed: selectedAvatar,
          bio: bio.trim(),
        });
        setIsEditing(false);
        setIsAvatarGridOpen(false);
      } catch (error) {
        console.error('Erro ao atualizar o perfil:', error);
      }
    }
  };

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

  return (
    <Modal.Root isOpen={isOpen} onClose={onClose}>
      <Modal.Overlay />
      <Modal.Content
        style={{
          padding: 0,
          backgroundColor: 'transparent',
          boxShadow: 'none',
          maxWidth: '450px',
        }}
      >
        <S.ProfileCard
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <S.CloseButton onClick={onClose} aria-label="Fechar modal">
            <X size={20} />
          </S.CloseButton>
          <S.ProfileHeader variants={itemVariants} />

          <S.AvatarContainer
            variants={itemVariants}
            initial={{ scale: 0.5, y: -50 }}
            animate={{ scale: 1, y: 0 }}
            transition={{
              type: 'spring',
              stiffness: 260,
              damping: 20,
              delay: 0.2,
            }}
          >
            <S.ProfileAvatar
              src={isEditing ? selectedAvatarSrc : avatarSrc}
              alt="User Avatar"
            />
            {isMyProfile && isEditing && (
              <S.EditAvatarButton
                onClick={() => setIsAvatarGridOpen((prev) => !prev)}
              >
                <PencilSimple size={18} />
              </S.EditAvatarButton>
            )}
          </S.AvatarContainer>

          <S.ContentWrapper>
            {' '}
            {/* Novo container para alinhar o conteúdo */}
            <S.UserInfo variants={itemVariants}>
              {isEditing ? (
                <S.StyledInput
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  maxLength={15}
                  placeholder="Seu nome de usuário"
                />
              ) : (
                <S.Username>{user.username}</S.Username>
              )}
              {user.fullTag && <S.UserTag>{user.fullTag}</S.UserTag>}
              {isEditing ? (
                <S.StyledTextArea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={100}
                  placeholder="Conte um pouco sobre você..."
                />
              ) : (
                user.bio && <S.UserBioText>{user.bio}</S.UserBioText>
              )}
            </S.UserInfo>
            <AnimatePresence>
              {isAvatarGridOpen && (
                <S.AvatarGrid
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  {avatarSeeds.map((seed) => (
                    <S.AvatarOption
                      key={seed}
                      $isSelected={selectedAvatar === seed}
                      onClick={() => setSelectedAvatar(seed)}
                      title={seed}
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
              )}
            </AnimatePresence>
            {!isEditing && ( // Stats só aparecem no modo de visualização
              <S.StatsContainer variants={itemVariants}>
                <S.StatBox>
                  <S.StatIcon>
                    <Star size={24} />
                  </S.StatIcon>
                  <S.StatInfo>
                    <S.StatValue>{user.xp.toLocaleString('pt-BR')}</S.StatValue>
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
            )}
            <ButtonGroup variants={itemVariants}>
              {isMyProfile ? (
                isEditing ? (
                  <>
                    <ActionButton variant="danger" onClick={handleCancel}>
                      Cancelar
                    </ActionButton>
                    <ActionButton variant="success" onClick={handleSave}>
                      Salvar
                    </ActionButton>
                  </>
                ) : (
                  <>
                    <ActionButton onClick={() => setIsEditing(true)}>
                      <PencilSimple size={18} /> Editar Perfil
                    </ActionButton>
                    <ActionButton onClick={handleAchievementsClick}>
                      <Trophy size={18} /> Conquistas
                    </ActionButton>
                  </>
                )
              ) : (
                renderFriendshipButton()
              )}
            </ButtonGroup>
          </S.ContentWrapper>
        </S.ProfileCard>
      </Modal.Content>
    </Modal.Root>
  );
}
