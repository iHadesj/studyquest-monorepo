import styled from 'styled-components';
import { Title } from '../../style/globalStyle';

export const EditorBox = styled.div`
  background-color: #2f3136;
  border-radius: 8px;
  width: 100%;
  max-width: 550px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const EditorTitle = styled(Title)`
  border: none;
  padding: 0;
  font-size: 1.75rem;
  margin-bottom: 0;
`;

export const EditorSubtitle = styled.p`
  color: #b9bbbe;
  margin-top: -0.5rem;
  margin-bottom: 1rem;
`;

export const UsernameInput = styled.input`
  width: 95%;
  padding: 0.75rem;
  background-color: #202225;
  border: 1px solid #40444b;
  border-radius: 4px;
  color: #dcddde;
  font-family: 'Fira Code', monospace;
  font-size: 1.2rem;
  text-align: center;
  margin-bottom: 1rem;
  &:focus {
    outline: none;
    border-color: #5865f2;
  }
`;

export const AvatarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
  max-height: 250px;
  overflow-y: auto;
  padding-right: 0.5rem;
`;

export const AvatarOption = styled.button<{ $isSelected: boolean }>`
  background-color: #36393f;
  border: 2px solid
    ${(props) => (props.$isSelected ? '#5865f2' : 'transparent')};
  border-radius: 8px;
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  transform: ${(props) => (props.$isSelected ? 'scale(1.1)' : 'scale(1)')};

  &:hover {
    border-color: #5865f2;
  }

  img {
    width: 100%;
    height: auto;
    display: block;
  }
`;

export const SaveButton = styled.button`
  background-color: #43b581;
  color: #ffffff;
  font-family: 'Fira Code', monospace;
  font-weight: bold;
  padding: 0.75rem 2rem;
  border-radius: 4px;
  font-size: 1.1rem;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
  &:disabled {
    background-color: #40444b;
    cursor: not-allowed;
  }
  &:hover:not(:disabled) {
    background-color: #3aa570;
  }
`;
