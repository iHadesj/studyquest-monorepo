import { useState, useMemo } from 'react';
import styled from 'styled-components';
import { motion, type Variants } from 'framer-motion';
import {
  Trophy,
  UserPlus,
  Check,
  X,
  Star,
  Swatches,
  Crown,
} from 'phosphor-react';

import * as Modal from '../Modal';
import { ProfileEditor } from '../ProfileEditor';
import { useFriendship } from '../../hooks/useFriendship';
import type { UserProfileData } from '../../interfaces';

import {
  ProfileCard,
  ProfileHeader,
  ProfileAvatar,
  UserInfo,
  Username,
  UserTag,
  StatsContainer,
  StatBox,
  StatIcon,
  StatInfo,
  StatValue,
  StatLabel,
  CloseButton,
} from './style';

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
  const [isEditing, setIsEditing] = useState(false);
  const { friendshipStatus, sendRequest, cancelRequest, handleRequest } =
    useFriendship(user?.uid || null);

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

  const handleAchievementsClick = () => {
    onNavigateToAchievements();
    onClose();
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
      case 'MYSELF':
      default:
        return null;
    }
  };

  return (
    <>
      <Modal.Root isOpen={isOpen} onClose={onClose}>
        <Modal.Overlay />
        <Modal.Content
          style={{
            padding: 0,
            backgroundColor: 'transparent',
            boxShadow: 'none',
          }}
        >
          <ProfileCard
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <CloseButton onClick={onClose} aria-label="Fechar modal">
              <X size={20} />
            </CloseButton>
            <ProfileHeader variants={itemVariants} />
            <ProfileAvatar
              src={avatarSrc}
              alt="User Avatar"
              variants={itemVariants}
              initial={{ scale: 0.5, y: -50 }}
              animate={{ scale: 1, y: 0 }}
              transition={{
                type: 'spring',
                stiffness: 260,
                damping: 20,
                delay: 0.2,
              }}
            />
            <div
              style={{
                padding: '0 1.5rem 1.5rem',
                width: '90%',
              }}
            >
              <UserInfo variants={itemVariants}>
                <Username>{user.username}</Username>
                {user.fullTag && <UserTag>{user.fullTag}</UserTag>}
              </UserInfo>

              <StatsContainer variants={itemVariants}>
                <StatBox>
                  <StatIcon>
                    <Star size={24} />
                  </StatIcon>
                  <StatInfo>
                    <StatValue>{user.xp.toLocaleString('pt-BR')}</StatValue>
                    <StatLabel>Total XP</StatLabel>
                  </StatInfo>
                </StatBox>
                <StatBox>
                  <StatIcon>
                    <Trophy size={24} />
                  </StatIcon>
                  <StatInfo>
                    <StatValue>{unlockedAchievementsCount}</StatValue>
                    <StatLabel>Conquistas</StatLabel>
                  </StatInfo>
                </StatBox>
                <StatBox>
                  <StatIcon>
                    <Swatches size={24} />
                  </StatIcon>
                  <StatInfo>
                    <StatValue>{completedTasks}</StatValue>
                    <StatLabel>Fases Concluídas</StatLabel>
                  </StatInfo>
                </StatBox>
                {user.rank && (
                  <StatBox>
                    <StatIcon>
                      <Crown size={24} />
                    </StatIcon>
                    <StatInfo>
                      <StatValue>#{user.rank}</StatValue>
                      <StatLabel>Ranking</StatLabel>
                    </StatInfo>
                  </StatBox>
                )}
              </StatsContainer>

              <ButtonGroup variants={itemVariants}>
                {isMyProfile ? (
                  <>
                    <ActionButton onClick={() => setIsEditing(true)}>
                      Editar Perfil
                    </ActionButton>
                    <ActionButton onClick={handleAchievementsClick}>
                      <Trophy size={18} />
                      Conquistas
                    </ActionButton>
                  </>
                ) : (
                  renderFriendshipButton()
                )}
              </ButtonGroup>
            </div>
          </ProfileCard>
        </Modal.Content>
      </Modal.Root>
      <ProfileEditor isOpen={isEditing} onClose={() => setIsEditing(false)} />
    </>
  );
}
