import styled from 'styled-components';
import { motion } from 'framer-motion'; // Importa o motion
import { Avatar as BaseAvatar } from '../../style/globalStyle';

export const FriendsListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-height: 400px;
  max-height: 60vh;
  overflow: hidden; // Ajuda a conter a animação
`;

export const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #40444b;
  position: relative; // Necessário para a barrinha animada
`;

// <<< MUDANÇA: Adicionamos a barrinha que vai animar
export const Underline = styled(motion.div)`
  position: absolute;
  bottom: -1px;
  height: 2px;
  background-color: #5865f2;
`;

export const TabButton = styled.button<{ $isActive: boolean }>`
  // Usa $
  flex: 1;
  padding: 0.75rem;
  background-color: transparent;
  border: none;
  color: ${({ $isActive }) => ($isActive ? '#ffffff' : '#b9bbbe')};
  font-family: 'Fira Code', monospace;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: color 0.2s;
  position: relative;

  &:hover {
    color: #ffffff;
  }
`;

// <<< MUDANÇA: A lista agora é um motion.div
export const ListContainer = styled(motion.div)`
  overflow-y: auto;
  padding-right: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  height: 100%;
`;

export const Status = styled.div<{ $isOnline: boolean }>`
  // Usa $
  font-size: 0.85rem;
  color: ${({ $isOnline }) => ($isOnline ? '#43b581' : '#72767d')};
  display: flex;
  align-items: center;
  gap: 0.25rem;

  &::before {
    content: '';
    display: block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: ${({ $isOnline }) => ($isOnline ? '#43b581' : '#72767d')};
  }
`;

// O resto do style.ts continua igual...
export const FooterContainer = styled.div`
  display: flex;
  align-items: flex-end;
  padding-top: 1rem;
  border-top: 1px solid #40444b;
`;

export const AddFriendInput = styled.input`
  flex: 1;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  border: 1px solid #333;
  background-color: #111;
  color: #fff;
  margin-right: 0.5rem;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

export const FriendActionButton = styled.button`
  background-color: #40444b;
  color: #dcddde;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-family: 'Fira Code', monospace;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background-color: #5865f2;
    color: white;
  }

  &:disabled {
    background-color: #2f3136;
    color: #72767d;
    cursor: not-allowed;
  }
`;

export const UserEntry = styled.div`
  display: flex;
  align-items: center;
  padding: 0.5rem;
  background-color: #36393f;
  border-radius: 4px;
  gap: 1rem;
`;

export const Avatar = styled(BaseAvatar)`
  width: 50px;
  height: 50px;
  border: 4px solid #4f545c;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
`;

export const UserInfo = styled.div`
  flex-grow: 1;
`;

export const Username = styled.p`
  margin: 0;
  font-weight: bold;
  color: #ffffff;
`;

export const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

export const ActionButton = styled.button<{
  variant: 'accept' | 'decline' | 'invite' | 'chat';
}>`
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;

  background-color: ${({ variant }) =>
    variant === 'accept'
      ? '#43b581'
      : variant === 'decline'
      ? '#ed4245'
      : variant === 'chat'
      ? '#50525e'
      : '#5865f2'};
  color: white;

  &:hover {
    filter: brightness(1.2);
  }

  &:disabled {
    background-color: #40444b;
    cursor: not-allowed;
  }
`;

export const EmptyState = styled.div`
  text-align: center;
  color: #72767d;
  padding: 3rem 1rem;
`;

export const CancelButton = styled.button<{
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
  padding: 0.5rem;
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
