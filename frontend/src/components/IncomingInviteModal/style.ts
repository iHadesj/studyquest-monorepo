import styled from 'styled-components';

export const InviteBox = styled.div`
  text-align: center;
  padding: 1rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const InviterTag = styled.strong`
  color: #7289da; /* Um azulzinho pra destacar */
  background-color: #292b2f;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-family: 'Fira Code', monospace;
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1.5rem;
`;

export const ActionButton = styled.button<{ accept?: boolean }>`
  font-family: 'Fira Code', monospace;
  font-weight: bold;
  font-size: 1rem;
  padding: 0.75rem 2rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  background-color: ${(props) => (props.accept ? '#43b581' : '#f04747')};
  color: white;

  &:hover {
    transform: scale(1.05);
    filter: brightness(1.1);
  }
`;
