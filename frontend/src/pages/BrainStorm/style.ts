// src/pages/BrainStorm/style.ts
import styled, { keyframes, css } from 'styled-components';
import { motion } from 'framer-motion';

// --- Animação de brilho para a barra de tempo ---
const glow = (color: string) => keyframes`
  0%, 100% { box-shadow: 0 0 3px ${color}, 0 0 6px ${color}; }
  50% { box-shadow: 0 0 8px ${color}, 0 0 16px ${color}; }
`;

// --- NOVA ANIMAÇÃO DE TREMER (COPIADA DA EXERCISEPAGE) ---
const shake = keyframes`
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
`;

export const StormWrapper = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 200px);
  gap: 1.5rem;
`;

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
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
  @media (max-width: 480px) {
    padding: 1.3rem;
  }
`;

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

// --- NOVO HEADER DE JOGO (HUD) ---
export const GameHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 1.5rem;
  max-width: 600px;
  background-color: #2f3136;
  padding: 0.5rem 1.5rem;
  border-radius: 12px;
  border: 1px solid #40444b;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
`;

export const MainTimer = styled.div`
  font-size: 1.75rem;
  font-weight: bold;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 0.75rem;

  svg {
    color: #5865f2;
  }

  @media (max-width: 480px) {
    font-size: 1.5rem;
  }
`;

export const StatsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

export const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: bold;
  color: #ffffff;
`;

export const TimerBarContainer = styled.div`
  width: 100%;
  max-width: 600px;
  height: 12px;
  background-color: #202225;
  border-radius: 6px;
  overflow: hidden;
`;

export const TimerBarProgress = styled.div<{ percentage: number }>`
  width: ${(props) => props.percentage}%;
  height: 100%;
  border-radius: 6px;

  background-color: ${(props) =>
    props.percentage > 50
      ? '#43b581'
      : props.percentage > 25
      ? '#faa61a'
      : '#ed4245'};

  animation: ${(props) =>
      glow(
        props.percentage > 50
          ? '#43b581'
          : props.percentage > 25
          ? '#faa61a'
          : '#ed4245'
      )}
    2s ease-in-out infinite;

  transition: width 0.2s linear, background-color 0.3s ease;
`;

// --- COMPONENTE REMOVIDO (NÃO PRECISAMOS MAIS DELE) ---
// export const FeedbackText ...

// --- NOVO OPTIONLABEL ESTILIZADO (COPIADO DA EXERCISEPAGE) ---
export const OptionLabel = styled(motion.label)<{
  $status: 'correct' | 'incorrect' | 'default';
}>`
  display: flex;
  align-items: center;
  padding: 0.75rem;
  background-color: #36393f;
  border-radius: 4px;
  border: 2px solid #40444b;
  cursor: pointer;
  transition: all 0.2s;

  @media (max-width: 480px) {
    font-size: 0.8rem;
  }

  &:hover {
    ${({ $status }) => $status === 'default' && `border-color: #5865f2;`}
  }

  ${({ $status }) =>
    $status === 'correct' &&
    css`
      background-color: #43b581;
      border-color: #3aa570;
      color: white;
      transform: scale(1.02);
    `}

  ${({ $status }) =>
    $status === 'incorrect' &&
    css`
      background-color: #ed4245;
      border-color: #d83c3e;
      color: white;
      animation: ${shake} 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
    `}
`;
