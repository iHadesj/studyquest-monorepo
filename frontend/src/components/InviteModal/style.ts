// src/components/InviteModal/style.ts
import styled from 'styled-components';
import { Avatar as BaseAvatar } from '../TopBar';

export const InviteBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  text-align: center;
`;

export const TagInput = styled.input`
  width: 95%;
  padding: 0.75rem;
  background-color: #202225;
  border: 1px solid #40444b;
  border-radius: 4px;
  color: #dcddde;
  font-family: 'Fira Code', monospace;
  font-size: 1.2rem;
  text-align: center;
  &:focus {
    outline: none;
    border-color: #5865f2;
  }
`;

export const InviteButton = styled.button`
  background-color: #43b581;
  color: #ffffff;
  font-weight: bold;
  padding: 0.75rem 2rem;
  border-radius: 4px;
  font-size: 1.1rem;
  border: none;
  cursor: pointer;
  &:hover:not(:disabled) {
    background-color: #3aa570;
  }
  &:disabled {
    background-color: #40444b;
    cursor: not-allowed;
  }
`;

export const Separator = styled.div`
  text-align: center;
  color: #72767d;
  font-weight: bold;
  margin: 0.5rem 0;
`;

export const FriendList = styled.div`
  max-height: 200px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-right: 0.5rem;
`;

export const FriendEntry = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem;
  background-color: #36393f;
  border-radius: 4px;
`;

export const Avatar = styled(BaseAvatar)`
  width: 40px;
  height: 40px;
`;

export const UserInfo = styled.div`
  flex-grow: 1;
  text-align: left;
  color: #ffffff;
  font-weight: bold;
`;

export const EmptyState = styled.div`
  text-align: center;
  color: #72767d;
  padding: 2rem 1rem;
`;
