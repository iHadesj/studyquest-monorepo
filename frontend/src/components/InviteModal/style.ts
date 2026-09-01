// src/components/InviteModal/style.ts
import styled from 'styled-components';
import { Avatar as BaseAvatar } from '../../style/globalStyle';
import { theme } from '../../style/theme';

export const InviteBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  text-align: center;
`;

export const TagInput = styled.input`
  width: 95%;
  padding: 0.75rem;
  background-color: ${theme.color.bgDeep};
  border: 1px solid ${theme.color.stroke};
  border-radius: 4px;
  color: ${theme.color.text};
  font-family: ${theme.font.sans};
  font-size: 1.2rem;
  text-align: center;
  &:focus {
    outline: none;
    border-color: ${theme.color.primary};
  }
`;

export const InviteButton = styled.button`
  background-color: ${theme.color.success};
  color: #ffffff;
  font-weight: bold;
  padding: 0.75rem 2rem;
  border-radius: 4px;
  font-size: 1.1rem;
  border: none;
  cursor: pointer;
  &:hover:not(:disabled) {
    background-color: ${theme.color.success};
  }
  &:disabled {
    background-color: ${theme.color.stroke};
    cursor: not-allowed;
  }
`;

export const Separator = styled.div`
  text-align: center;
  color: ${theme.color.textFaint};
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
  background-color: ${theme.color.bg};
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
  color: ${theme.color.textFaint};
  padding: 2rem 1rem;
`;
