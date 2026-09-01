import styled, { css, keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { theme } from '../../style/theme';

const shake = keyframes`
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
`;

export const ExerciseContainer = styled.div`
  max-width: 44rem;
  margin: 0 auto;
`;

/* -------------------------------------------------------- cabeçalho ----- */

export const ExerciseHeader = styled.div`
  margin-bottom: 1.5rem;

  .topo {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 0.75rem;
  }

  .titulo {
    margin: 0;
    font-size: 1.15rem;
    font-weight: 700;
    letter-spacing: -0.4px;
    color: ${theme.color.text};
  }

  .contador {
    flex-shrink: 0;
    font-size: 0.82rem;
    font-weight: 600;
    color: ${theme.color.textFaint};
    font-variant-numeric: tabular-nums;
  }
`;

/** Barra de avanço no lugar do "Questão 3 de 10" solto no meio da tela. */
export const ProgressTrack = styled.div`
  height: 5px;
  width: 100%;
  border-radius: ${theme.radius.pill};
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid ${theme.color.stroke};
  overflow: hidden;
`;

export const ProgressFill = styled(motion.div)`
  height: 100%;
  border-radius: ${theme.radius.pill};
  background: ${theme.gradient.primary};
`;

/* ---------------------------------------------------------- questão ----- */

export const QuestionCard = styled(motion.div)`
  background: ${theme.color.glass};
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid ${theme.color.stroke};
  border-radius: ${theme.radius.lg};
  padding: 1.75rem;
  box-shadow: ${theme.shadow.md};

  @media (max-width: 480px) {
    padding: 1.25rem;
  }
`;

export const QuestionText = styled.p`
  font-size: 1.08rem;
  font-weight: 600;
  line-height: 1.6;
  margin: 0 0 1.5rem;
  color: ${theme.color.text};

  code {
    font-family: ${theme.font.mono};
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid ${theme.color.stroke};
    color: ${theme.color.cyan};
    padding: 0.12rem 0.4rem;
    border-radius: ${theme.radius.sm};
    font-size: 0.88em;
  }

  @media (max-width: 480px) {
    font-size: 0.98rem;
  }
`;

export const OptionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
`;

/**
 * Alternativa como linha inteira clicável, com letra à esquerda.
 * O radio nativo continua lá para teclado e leitor de tela, mas visualmente
 * some: a própria linha comunica a seleção.
 */
export const OptionRow = styled(motion.label)<{
  $status: 'correct' | 'incorrect' | 'default';
  $selected: boolean;
}>`
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.9rem;
  padding: 0.9rem 1rem;
  border-radius: ${theme.radius.md};
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid ${theme.color.stroke};
  cursor: pointer;
  font-size: 0.95rem;
  line-height: 1.45;
  color: ${theme.color.text};
  transition: background 200ms ease, border-color 200ms ease,
    transform 200ms ${theme.ease.out};

  input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }

  .letra {
    flex-shrink: 0;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.78rem;
    font-weight: 700;
    background: rgba(0, 0, 0, 0.35);
    border: 1px solid ${theme.color.stroke};
    color: ${theme.color.textMuted};
    transition: all 200ms ease;
  }

  .marca {
    margin-left: auto;
    flex-shrink: 0;
    display: flex;
  }

  &:hover {
    ${({ $status }) =>
      $status === 'default' &&
      css`
        background: ${theme.color.glassStrong};
        border-color: rgba(124, 92, 255, 0.45);
        transform: translateX(3px);
      `}
  }

  ${({ $selected, $status }) =>
    $selected &&
    $status === 'default' &&
    css`
      background: rgba(124, 92, 255, 0.14);
      border-color: ${theme.color.primary};
      .letra {
        background: ${theme.color.primary};
        border-color: ${theme.color.primary};
        color: #fff;
      }
    `}

  ${({ $status }) =>
    $status === 'correct' &&
    css`
      background: rgba(52, 211, 153, 0.14);
      border-color: ${theme.color.success};
      color: #fff;
      .letra {
        background: ${theme.color.success};
        border-color: ${theme.color.success};
        color: #04231a;
      }
      .marca {
        color: ${theme.color.success};
      }
    `}

  ${({ $status }) =>
    $status === 'incorrect' &&
    css`
      background: rgba(251, 113, 133, 0.14);
      border-color: ${theme.color.danger};
      color: #fff;
      animation: ${shake} 0.6s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
      .letra {
        background: ${theme.color.danger};
        border-color: ${theme.color.danger};
        color: #2a0a10;
      }
      .marca {
        color: ${theme.color.danger};
      }
    `}
`;

export const ActionBar = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 1.5rem;

  @media (max-width: 480px) {
    justify-content: stretch;
    button {
      width: 100%;
    }
  }
`;

export const ActionButton = styled.button`
  background: ${(p) =>
    p.disabled ? 'rgba(255,255,255,0.06)' : theme.gradient.primary};
  color: ${(p) => (p.disabled ? theme.color.textFaint : '#fff')};
  font-family: ${theme.font.sans};
  font-weight: 700;
  padding: 0.8rem 2rem;
  border-radius: ${theme.radius.pill};
  font-size: 0.95rem;
  border: none;
  cursor: ${(p) => (p.disabled ? 'not-allowed' : 'pointer')};
  box-shadow: ${(p) => (p.disabled ? 'none' : theme.shadow.md)};
  transition: transform 240ms ${theme.ease.bounce}, filter 240ms ease,
    box-shadow 240ms ease;

  &:hover:not(:disabled) {
    transform: translateY(-3px);
    filter: brightness(1.08);
  }
  &:active:not(:disabled) {
    transform: translateY(0) scale(0.97);
  }
`;

/* --------------------------------------------------------- resultado ---- */

export const ResultIcon = styled.div<{ $ok: boolean }>`
  width: 68px;
  height: 68px;
  margin: 0 auto 1rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(p) => (p.$ok ? theme.color.success : theme.color.danger)};
  background: ${(p) =>
    p.$ok ? 'rgba(52, 211, 153, 0.12)' : 'rgba(251, 113, 133, 0.12)'};
  border: 1px solid
    ${(p) =>
      p.$ok ? 'rgba(52, 211, 153, 0.35)' : 'rgba(251, 113, 133, 0.35)'};
`;

export const StarsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin: 1.25rem 0;
`;

export const ScoreLine = styled.p`
  margin: 0;
  color: ${theme.color.textMuted};
  font-size: 0.95rem;

  strong {
    color: ${theme.color.text};
    font-weight: 700;
  }
`;

export const RewardRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1.25rem;
`;

export const RewardChip = styled.span<{ $accent: string }>`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.9rem;
  border-radius: ${theme.radius.pill};
  font-size: 0.85rem;
  font-weight: 700;
  color: ${(p) => p.$accent};
  background: ${(p) => p.$accent}1f;
  border: 1px solid ${(p) => p.$accent}55;
`;

export const ReviewSection = styled.div`
  margin-top: 1.75rem;
  text-align: left;

  h4 {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0 0 0.85rem;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    color: ${theme.color.textFaint};
  }
`;

export const ReviewList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  max-height: 260px;
  overflow-y: auto;
  padding-right: 0.35rem;
`;

export const ReviewItem = styled.div`
  border: 1px solid ${theme.color.stroke};
  border-radius: ${theme.radius.md};
  background: rgba(0, 0, 0, 0.28);
  padding: 0.9rem 1rem;

  .pergunta {
    margin: 0 0 0.6rem;
    font-size: 0.88rem;
    font-weight: 600;
    line-height: 1.45;
    color: ${theme.color.text};
  }

  .linha {
    display: flex;
    gap: 0.5rem;
    align-items: flex-start;
    font-size: 0.82rem;
    line-height: 1.4;

    & + .linha {
      margin-top: 0.3rem;
    }

    .rotulo {
      flex-shrink: 0;
      color: ${theme.color.textFaint};
    }
  }

  .errada {
    color: ${theme.color.danger};
  }
  .certa {
    color: ${theme.color.success};
  }
`;
