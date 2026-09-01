import styled from 'styled-components';
import { motion } from 'framer-motion';
import { theme } from '../../style/theme';

export const ContentWrapper = styled.div`
  max-width: 46rem;
  margin: 0 auto;
  padding-bottom: 4rem;
`;

/**
 * Cartão de leitura. A medida é curta de propósito (~68ch) e a entrelinha
 * folgada: aqui a pessoa lê texto corrido, não bate o olho num painel.
 */
export const ContentCard = styled(motion.div)`
  position: relative;
  background: ${theme.color.glass};
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  padding: 1.6rem 1.75rem;
  border-radius: ${theme.radius.lg};
  border: 1px solid ${theme.color.stroke};
  margin-bottom: 1.1rem;
  white-space: pre-wrap;
  color: ${theme.color.text};
  font-size: 1rem;
  line-height: 1.75;
  max-width: 68ch;
  transition: border-color 240ms ease, background 240ms ease;

  /* Marca de parágrafo na lateral, que acende ao passar o cursor. */
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 1.6rem;
    bottom: 1.6rem;
    width: 2px;
    border-radius: 0 2px 2px 0;
    background: ${theme.gradient.primary};
    opacity: 0;
    transition: opacity 240ms ease;
  }

  &:hover {
    border-color: ${theme.color.strokeStrong};
    background: ${theme.color.glassStrong};
    &::before {
      opacity: 1;
    }
  }

  h3 {
    margin: 0 0 0.75rem;
    font-size: 1.05rem;
    font-weight: 700;
    letter-spacing: -0.3px;
    color: ${theme.color.primarySoft};
  }

  p {
    margin: 0;
    line-height: 1.75;
    color: ${theme.color.text};
  }

  strong {
    color: #fff;
    font-weight: 600;
  }

  code {
    font-family: ${theme.font.mono};
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid ${theme.color.stroke};
    color: ${theme.color.cyan};
    padding: 0.12rem 0.4rem;
    border-radius: ${theme.radius.sm};
    font-size: 0.88em;
    /* Uma expressão não deve quebrar no meio ao virar a linha. */
    white-space: nowrap;
  }

  @media (max-width: 480px) {
    padding: 1.25rem;
    font-size: 0.95rem;
  }
`;

export const StartExercisesButton = styled.button`
  background: ${theme.gradient.success};
  color: #04231a;
  font-family: ${theme.font.sans};
  font-weight: 800;
  padding: 0.85rem 2rem;
  border-radius: ${theme.radius.pill};
  font-size: 1rem;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin: 2.5rem auto 0;
  box-shadow: ${theme.shadow.md};
  transition: transform 240ms ${theme.ease.bounce}, box-shadow 240ms ease,
    filter 240ms ease;

  &:hover {
    transform: translateY(-3px);
    filter: brightness(1.06);
    box-shadow: 0 14px 34px rgba(52, 211, 153, 0.32);
  }
  &:active {
    transform: translateY(0) scale(0.97);
  }
`;

/** Cabeçalho da leitura: rótulo da matéria + título do conteúdo. */
export const ReadingHeader = styled.div`
  margin-bottom: 2rem;

  .rotulo {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: ${theme.color.textFaint};
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 1.4px;
    text-transform: uppercase;
    margin-bottom: 0.75rem;
  }

  h1 {
    margin: 0;
    font-size: clamp(1.6rem, 4vw, 2.3rem);
    font-weight: 700;
    letter-spacing: -1px;
    line-height: 1.15;
    color: ${theme.color.text};
  }
`;
