import styled from 'styled-components';
import { BackButton } from '../../style/globalStyle';
import { theme } from '../../style/theme';

// --- COMPONENTES ESTILIZADOS (ATUALIZADOS) ---
export const HubWrapper = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 44rem;
  margin: 0 auto;
  margin-top: 2rem;
  text-align: center;
`;

export const HubHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 3rem;
  position: relative;
`;

export const AlignedBackButton = styled(BackButton)`
  position: absolute;
  left: 0;
  top: 0;
  transform: translateY(-50%);
  margin-bottom: 0;
`;

export const OptionsContainer = styled.div`
  display: flex;
  gap: 1.25rem;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

export const OptionButton = styled.button`
  position: relative;
  flex: 1;
  padding: 2.25rem 1.5rem;
  border-radius: ${theme.radius.lg};
  border: 1px solid ${theme.color.stroke};
  background: ${theme.color.glass};
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  color: ${theme.color.text};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  overflow: hidden;
  box-shadow: ${theme.shadow.sm};
  transition: transform 280ms ${theme.ease.bounce}, border-color 240ms ease,
    box-shadow 240ms ease, background 240ms ease;

  /* Brilho radial que acende sob o cursor. */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(
      100% 80% at 50% 0%,
      rgba(124, 92, 255, 0.28) 0%,
      transparent 65%
    );
    opacity: 0;
    transition: opacity 320ms ${theme.ease.out};
  }

  svg {
    position: relative;
    color: ${theme.color.primarySoft};
    transition: transform 320ms ${theme.ease.bounce}, color 240ms ease;
  }

  h2 {
    position: relative;
    font-family: ${theme.font.sans};
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0;
    color: #ffffff;
    letter-spacing: -0.4px;
  }

  &:hover:not(:disabled) {
    background: ${theme.color.glassStrong};
    border-color: rgba(124, 92, 255, 0.5);
    transform: translateY(-6px);
    box-shadow: ${theme.shadow.lg};

    &::before {
      opacity: 1;
    }
    svg {
      transform: translateY(-4px) scale(1.12);
      color: ${theme.color.cyan};
    }
  }

  &:active:not(:disabled) {
    transform: translateY(-2px) scale(0.98);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
    svg {
      color: ${theme.color.textFaint};
    }
  }
`;
