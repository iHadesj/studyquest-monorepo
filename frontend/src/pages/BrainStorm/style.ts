// src/pages/BrainStorm/style.ts
import styled from 'styled-components';

export const StormWrapper = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 200px);
  gap: 1.5rem;
`;

// --- Container Padrão para Telas de Idle e Resultado ---
export const CardContainer = styled.div`
  background-color: #2f3136;
  border: 1px solid #40444b;
  border-radius: 8px;
  padding: 2.5rem;
  width: 100%;
  max-width: 700px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
`;

// --- Tela de Idle ---
export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  width: 100%;
  margin-top: 1rem;
`;

export const StatCard = styled.div`
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid #40444b;
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 1rem;
  text-align: left;
`;

export const IconCircle = styled.div<{ bg?: string }>`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: ${(p) => p.bg || 'linear-gradient(180deg,#2b6cb0,#2c5282)'};
  flex-shrink: 0;
`;

// --- Tela de Jogo (Playing) ---
export const GameHeader = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 100%;
  max-width: 600px;
  background-color: #2f3136;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid #40444b;
`;

export const StatItem = styled.span`
  color: #b9bbbe;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  font-weight: bold;

  strong {
    color: #ffffff;
  }
`;

export const TimerBarContainer = styled.div`
  width: 100%;
  max-width: 600px;
  height: 10px;
  background-color: #40444b;
  border-radius: 5px;
  overflow: hidden;
`;

export const TimerBarProgress = styled.div<{ percentage: number }>`
  width: ${(props) => props.percentage}%;
  height: 100%;
  background-color: ${(props) =>
    props.percentage > 50
      ? '#43b581'
      : props.percentage > 25
      ? '#faa61a'
      : '#ed4245'};
  transition: width 0.2s linear;
`;

export const FeedbackText = styled.p<{ $isCorrect: boolean }>`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${(props) => (props.$isCorrect ? '#43b581' : '#ed4245')};
  height: 30px;
  margin: 0;
`;
