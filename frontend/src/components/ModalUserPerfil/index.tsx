// src/components/ModalUserPerfil/index.tsx
import styled from 'styled-components';
import { useProgressStore } from '../../hooks/useProgressStore';
import * as Modal from '../Modal';
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
import { useMemo, useState } from 'react';
import { ProfileEditor } from '../ProfileEditor';
import { Trophy } from 'phosphor-react';

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const ActionButton = styled.button`
  background-color: #5865f2;
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

  &:hover {
    background-color: #4f5bd5;
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
  onNavigateToAchievements: () => void;
  rank?: number;
}

export function ModalUserPerfil({
  isOpen,
  onClose,
  onNavigateToAchievements,
  rank,
}: ModalUserPerfilProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { username, avatarSeed, xp, progress, fullTag } = useProgressStore();

  const completedTasks = useMemo(() => {
    if (!progress) return 0;
    return Object.values(progress)
      .flatMap((subject) => Object.values(subject))
      .filter((level) => level.concluido).length;
  }, [progress]);

  const devTag = 'Edu.dev#8636';
  const avatarSrc =
    fullTag === devTag
      ? '/Light.jpg'
      : `https://api.dicebear.com/8.x/pixel-art/svg?seed=${avatarSeed}`;

  const handleAchievementsClick = () => {
    onNavigateToAchievements();
    onClose();
  };

  return (
    <>
      <Modal.Root isOpen={isOpen} onClose={onClose}>
        <Modal.Overlay />
        <Modal.Content>
          <Modal.Header>
            <Modal.Title>Perfil do Jogador</Modal.Title>
            <Modal.Close />
          </Modal.Header>
          <Modal.Body>
            <ProfileWrapper>
              <ProfileAvatar src={avatarSrc} alt="User Avatar" />
              <UserInfo>
                <Username>{username}</Username>
                {fullTag && <UserTag>{fullTag}</UserTag>}
              </UserInfo>

              <StatsContainer>
                <StatBox>
                  <StatValue>{xp.toLocaleString('pt-BR')}</StatValue>
                  <StatLabel>Total XP</StatLabel>
                </StatBox>

                {rank && (
                  <StatBox>
                    <StatValue>#{rank}</StatValue>
                    <StatLabel>Ranking</StatLabel>
                  </StatBox>
                )}

                <StatBox>
                  <StatValue>{completedTasks}</StatValue>
                  <StatLabel>Fases Concluídas</StatLabel>
                </StatBox>
              </StatsContainer>
              <ButtonGroup>
                <ActionButton onClick={() => setIsEditing(true)}>
                  Editar Perfil
                </ActionButton>
                {/* 3. NOVO BOTÃO */}
                <ActionButton onClick={handleAchievementsClick}>
                  <Trophy size={18} />
                  Conquistas
                </ActionButton>
              </ButtonGroup>
            </ProfileWrapper>
          </Modal.Body>
        </Modal.Content>
      </Modal.Root>
      <ProfileEditor isOpen={isEditing} onClose={() => setIsEditing(false)} />
    </>
  );
}
