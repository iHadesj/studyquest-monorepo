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
  const { username, avatarSeed, xp, progress } = useProgressStore();

  const completedTasks = useMemo(() => {
    if (!progress) return 0;
    return Object.values(progress)
      .flatMap((subject) => Object.values(subject))
      .filter((level) => level.concluido).length;
  }, [progress]);

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
              <ProfileAvatar
                src={`https://api.dicebear.com/8.x/pixel-art/svg?seed=${avatarSeed}`}
                alt="User Avatar"
              />
              <UserInfo>
                <Username>{username}</Username>
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
