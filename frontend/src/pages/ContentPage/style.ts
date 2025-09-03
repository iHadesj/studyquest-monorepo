import styled from 'styled-components';

// --- COMPONENTES ESTILIZADOS ---
export const ContentWrapper = styled.div`
  max-width: 48rem;
  margin: 0 auto;
`;

export const SummaryText = styled.p`
  font-size: 1.25rem;
  line-height: 1.8;
  color: #dcddde;
  white-space: pre-wrap;

  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
`;

export const StartExercisesButton = styled.button`
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
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 2rem auto 0;

  &:hover {
    background-color: #3aa570;
  }
`;
