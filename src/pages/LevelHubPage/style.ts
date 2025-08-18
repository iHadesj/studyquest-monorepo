import styled from 'styled-components';

// --- COMPONENTES ESTILIZADOS ---
export const HubWrapper = styled.div`
  max-width: 42rem;
  margin: 0 auto;
  text-align: center;
`;

export const OptionsContainer = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-top: 3rem;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

export const OptionButton = styled.button`
  flex: 1;
  padding: 2rem;
  border-radius: 8px;
  border: 1px solid #40444b;
  background-color: #2f3136;
  color: #dcddde;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;

  &:hover {
    background-color: #40444b;
    transform: translateY(-4px);
  }

  h2 {
    font-family: 'Fira Code', monospace;
    font-size: 1.5rem;
    margin: 0;
    color: #ffffff;
  }
`;
