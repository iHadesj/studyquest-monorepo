// pages/MultiplayerLobbyPage/style.ts

import styled from 'styled-components';
import { Card, FormControlLabel } from '@mui/material';
import { motion } from 'framer-motion';
import { theme } from '../../style/theme';

// --- Layout Principal ---
export const LobbyWrapper = styled.div`
  max-width: 50rem;
  margin: 1rem auto;
  padding: 1rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

// --- Cabeçalho "Versus" ---
export const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background-color: ${theme.color.bgRaised};
  border-radius: 8px;
`;

export const PlayerInfo = styled.div<{ isMe?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: ${(props) => (props.isMe ? theme.color.primary : 'white')};
  font-weight: ${(props) => (props.isMe ? 'bold' : 'normal')};
  flex-basis: 30%; // Garante espaço pra cada jogador

  .tag {
    font-size: 0.9rem;
    max-width: 150px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .score {
    font-size: 1.75rem;
    font-weight: bold;
  }
`;

export const CentralTimer = styled(motion.div)<{ timeLow: boolean }>`
  font-size: 2.5rem;
  font-weight: bold;
  color: ${(props) => (props.timeLow ? theme.color.danger : '#faa61a')};
`;

// --- Card da Pergunta ---
export const QuestionCard = styled(motion(Card))`
  background-color: ${theme.color.bgDeep} !important;
  color: white !important;
  padding: 2rem;
  border-radius: 8px !important;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

// --- Opções de Resposta Estilizadas ---
export const OptionsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;

  @media (min-width: 600px) {
    grid-template-columns: 1fr 1fr;
  }
`;

export const StyledFormControlLabel = styled(FormControlLabel)<{
  $selected: boolean;
}>`
  background-color: ${(props) => (props.$selected ? theme.color.primary : theme.color.bg)};
  border: 2px solid ${(props) => (props.$selected ? '#7289da' : theme.color.bgRaised)};
  border-radius: 8px;
  padding: 0.5rem 1rem;
  margin: 0 !important;
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: ${theme.color.stroke};
    border-color: ${theme.color.primary};
  }

  .MuiRadio-root {
    display: none; // Esconde a bolinha do radio
  }

  .MuiFormControlLabel-label {
    width: 100%; // Faz o texto ocupar todo o espaço
  }
`;

// --- Feedback Overlay ---
export const FeedbackOverlay = styled(motion.div)<{ $isCorrect?: boolean }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 2rem 3rem;
  background-color: rgba(47, 49, 54, 0.95);
  border: 3px solid ${(props) => (props.$isCorrect ? theme.color.success : theme.color.danger)};
  border-radius: 16px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  pointer-events: none; // Impede que o overlay bloqueie cliques

  .status {
    font-size: 3rem;
    font-weight: bold;
    color: ${(props) => (props.$isCorrect ? theme.color.success : theme.color.danger)};
  }

  .points {
    font-size: 1.5rem;
    font-weight: bold;
    color: ${theme.color.gold};
  }
`;

export const WaitingText = styled.h2`
  color: ${theme.color.textMuted};
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

// ==========================================================
// >>>>> COMPONENTE FALTANTE ADICIONADO AQUI <<<<<
// ==========================================================
export const GameOverScreen = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  background-color: ${theme.color.bgDeep};
  border-radius: 8px;
  width: 100%;
`;
