import styled from 'styled-components';
import * as Modal from '../Modal';
import { ProfileEditor } from '../ProfileEditor';
import { useMemo, useState } from 'react';
import { Trophy, UserPlus, Check, X } from 'phosphor-react';
import {
  ProfileWrapper,
  ProfileAvatar,
  UserInfo,
  Username,
  StatsContainer,
  StatBox,
  StatValue,
  StatLabel,
} from './style';
import type { UserProfileData } from '../../interfaces';
import { useFriendship } from '../../hooks/useFriendship';

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
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

const UserTag = styled.p`
  color: #b9bbbe;
  font-size: 0.9rem;
  margin: -0.5rem 0 0 0;
  background-color: #202225;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
`;

interface ModalUserPerfilProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToAchievements?: () => void;
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

  // O useMemo VEM PRA CIMA, pra ser chamado em toda renderização
  const completedTasks = useMemo(() => {
    if (!user?.progress) return 0;
    return Object.values(user.progress)
      .flatMap((subject: any) => Object.values(subject))
      .filter((level: any) => level.concluido).length;
  }, [user?.progress]);

  // Agora o IF vem depois, sem problemas
  if (!user) {
    return null;
  }

  const isMyProfile = friendshipStatus === 'MYSELF';
  const unlockedAchievementsCount = user.unlockedAchievements?.length || 0;

  const devTag = 'Edu.dev#8636';
  const avatarSrc =
    user.fullTag === devTag
      ? '/Light.jpg'
      : `https://api.dicebear.com/8.x/pixel-art/svg?seed=${user.avatarSeed}`;

  const handleAchievementsClick = () => {
    if (onNavigateToAchievements) onNavigateToAchievements();
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
        <Modal.Content>
          <Modal.Header>
            <Modal.Title>
              {isMyProfile ? 'Seu Perfil' : `Perfil de ${user.username}`}
            </Modal.Title>
            <Modal.Close />
          </Modal.Header>
          <Modal.Body>
            <ProfileWrapper>
              <ProfileAvatar src={avatarSrc} alt="User Avatar" />
              <UserInfo>
                <Username>{user.username}</Username>
                {user.fullTag && <UserTag>{user.fullTag}</UserTag>}
              </UserInfo>
              <StatsContainer>
                <StatBox>
                  <StatValue>{user.xp.toLocaleString('pt-BR')}</StatValue>
                  <StatLabel>Total XP</StatLabel>
                </StatBox>
                <StatBox>
                  <StatValue>{unlockedAchievementsCount}</StatValue>
                  <StatLabel>Conquistas</StatLabel>
                </StatBox>
                <StatBox>
                  <StatValue>{completedTasks}</StatValue>
                  <StatLabel>Fases Concluídas</StatLabel>
                </StatBox>
                {user.rank && (
                  <StatBox>
                    <StatValue>#{user.rank}</StatValue>
                    <StatLabel>Ranking</StatLabel>
                  </StatBox>
                )}
              </StatsContainer>
              <ButtonGroup>
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
            </ProfileWrapper>
          </Modal.Body>
        </Modal.Content>
      </Modal.Root>
      <ProfileEditor isOpen={isEditing} onClose={() => setIsEditing(false)} />
    </>
  );
}
