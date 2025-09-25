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

const EditProfileButton = styled.button`
  background-color: #5865f2;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  margin-top: 1rem;
  font-family: 'Fira Code', monospace;
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
  rank?: number;
}

export function ModalUserPerfil({
  isOpen,
  onClose,
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
              <EditProfileButton onClick={() => setIsEditing(true)}>
                Editar Perfil
              </EditProfileButton>
            </ProfileWrapper>
          </Modal.Body>
        </Modal.Content>
      </Modal.Root>
      <ProfileEditor isOpen={isEditing} onClose={() => setIsEditing(false)} />
    </>
  );
}
