import styled from 'styled-components';
import { Title } from '../../style/globalStyle';
import { theme } from '../../style/theme';

export const EditorBox = styled.div`
  background-color: ${theme.color.bgRaised};
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
  color: ${theme.color.textMuted};
  margin-top: -0.5rem;
  margin-bottom: 1rem;
`;

export const UsernameInput = styled.input`
  width: 95%;
  padding: 0.75rem;
  background-color: ${theme.color.bgDeep};
  border: 1px solid ${theme.color.stroke};
  border-radius: 4px;
  color: ${theme.color.text};
  font-family: ${theme.font.sans};
  font-size: 1.2rem;
  text-align: center;
  margin-bottom: 1rem;
  &:focus {
    outline: none;
    border-color: ${theme.color.primary};
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
  background-color: ${theme.color.bg};
  border: 2px solid
    ${(props) => (props.$isSelected ? theme.color.primary : 'transparent')};
  border-radius: 8px;
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  transform: ${(props) => (props.$isSelected ? 'scale(1.1)' : 'scale(1)')};

  &:hover {
    border-color: ${theme.color.primary};
  }

  img {
    width: 100%;
    height: auto;
    display: block;
  }
`;

export const SaveButton = styled.button`
  background-color: ${theme.color.success};
  color: #ffffff;
  font-family: ${theme.font.sans};
  font-weight: bold;
  padding: 0.75rem 2rem;
  border-radius: 4px;
  font-size: 1.1rem;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
  &:disabled {
    background-color: ${theme.color.stroke};
    cursor: not-allowed;
  }
  &:hover:not(:disabled) {
    background-color: ${theme.color.success};
  }
`;
