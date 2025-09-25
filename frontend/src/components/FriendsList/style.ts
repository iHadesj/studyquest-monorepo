import styled from 'styled-components';

export const FriendsListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-height: 400px;
  max-height: 60vh;
`;

export const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #40444b;
`;

export const TabButton = styled.button<{ isActive: boolean }>`
  flex: 1;
  padding: 0.75rem;
  background-color: ${(props) => (props.isActive ? '#2f3136' : 'transparent')};
  border: none;
  color: ${(props) => (props.isActive ? '#ffffff' : '#b9bbbe')};
  font-family: 'Fira Code', monospace;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  border-bottom: 2px solid
    ${(props) => (props.isActive ? '#5865f2' : 'transparent')};
  transition: all 0.2s;

  &:hover {
    background-color: #40444b;
  }
`;

export const List = styled.div`
  overflow-y: auto;
  padding-right: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

export const UserEntry = styled.div`
  display: flex;
  align-items: center;
  padding: 0.5rem;
  background-color: #36393f;
  border-radius: 4px;
  gap: 1rem;
`;

export const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
`;

export const UserInfo = styled.div`
  flex-grow: 1;
`;

export const Username = styled.p`
  margin: 0;
  font-weight: bold;
  color: #ffffff;
`;

export const Status = styled.div<{ isOnline: boolean }>`
  font-size: 0.75rem;
  color: ${(props) => (props.isOnline ? '#43b581' : '#72767d')};
  display: flex;
  align-items: center;
  gap: 0.25rem;

  &::before {
    content: '';
    display: block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: ${(props) => (props.isOnline ? '#43b581' : '#72767d')};
  }
`;

export const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

export const ActionButton = styled.button<{
  variant: 'accept' | 'decline' | 'invite';
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
