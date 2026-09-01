import styled, { keyframes } from 'styled-components';
import { theme } from '../../style/theme';

// --- 1. ESTILOS (Toda a parte de Styled Components) ---
export const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const cardIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(22px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

const iconFloat = keyframes`
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-7px); }
`;

const iconGlow = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(124, 92, 255, 0.5), ${theme.shadow.md}; }
  50%      { box-shadow: 0 0 0 14px rgba(124, 92, 255, 0), ${theme.shadow.md}; }
`;

/* O container é transparente: o AuroraBackground é quem pinta o fundo. */
export const AuthContainer = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 1.5rem;
`;

export const AuthBox = styled.div`
  position: relative;
  background: linear-gradient(
    160deg,
    rgba(30, 30, 48, 0.82) 0%,
    rgba(16, 16, 28, 0.88) 100%
  );
  backdrop-filter: blur(22px) saturate(150%);
  -webkit-backdrop-filter: blur(22px) saturate(150%);
  border: 1px solid ${theme.color.strokeStrong};
  padding: 3rem 2.75rem;
  border-radius: ${theme.radius.xl};
  width: 100%;
  max-width: 420px;
  text-align: center;
  box-shadow: ${theme.shadow.lg};
  animation: ${cardIn} 0.6s ${theme.ease.out};

  /* Fio de luz no topo do card. */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 12%;
    right: 12%;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      ${theme.color.primarySoft},
      transparent
    );
  }

  @media (max-width: 480px) {
    padding: 2.25rem 1.5rem;
  }
`;

export const LogoContainer = styled.div`
  margin-bottom: 2.5rem;
  font-size: 2.5rem;
  font-weight: 700;
  color: ${theme.color.text};
  letter-spacing: -0.05em;
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  animation: ${fadeIn} 0.5s ${theme.ease.out};
`;

export const InputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

export const InputLabel = styled.label`
  position: absolute;
  top: -10px;
  left: 10px;
  background: ${theme.color.bgRaised};
  padding: 0 5px;
  color: ${theme.color.textMuted};
  font-size: 0.75rem;
  pointer-events: none;
  z-index: 1;
`;

export const Input = styled.input`
  width: 100%;
  padding: 0.95rem 1rem;
  box-sizing: border-box;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid ${theme.color.stroke};
  border-radius: ${theme.radius.md};
  color: ${theme.color.text};
  font-family: ${theme.font.sans};
  font-size: 0.92rem;
  transition: border-color 220ms ease, box-shadow 220ms ease,
    background 220ms ease;

  &:focus {
    outline: none;
    border-color: ${theme.color.primary};
    background: rgba(0, 0, 0, 0.42);
    box-shadow: 0 0 0 3px rgba(124, 92, 255, 0.18);
  }

  &::placeholder {
    color: ${theme.color.textFaint};
  }
`;

export const PasswordToggleButton = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: ${theme.color.textMuted};
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  z-index: 2;
  transition: color 200ms ease, transform 220ms ${theme.ease.bounce};

  &:hover {
    color: ${theme.color.primarySoft};
    transform: translateY(-50%) scale(1.15);
  }
`;

export const Button = styled.button`
  position: relative;
  overflow: hidden;
  background: ${theme.gradient.primary};
  color: #ffffff;
  font-family: ${theme.font.sans};
  font-weight: 800;
  padding: 0.95rem;
  border-radius: ${theme.radius.pill};
  font-size: 0.98rem;
  border: none;
  cursor: pointer;
  margin-top: 0.35rem;
  box-shadow: 0 10px 28px rgba(124, 92, 255, 0.32);
  transition: transform 240ms ${theme.ease.bounce}, box-shadow 240ms ease,
    filter 240ms ease;

  &:hover {
    transform: translateY(-3px);
    filter: brightness(1.08);
    box-shadow: 0 14px 36px rgba(124, 92, 255, 0.45);
  }
  &:active {
    transform: translateY(0) scale(0.98);
  }
`;

export const ToggleText = styled.p`
  color: ${theme.color.textMuted};
  cursor: pointer;
  font-size: 0.85rem;
  margin-top: 1.5rem;
  text-decoration: none;
  transition: color 200ms ease;

  &:hover {
    color: ${theme.color.primarySoft};
  }
`;

export const MessageText = styled.p`
  font-size: 0.85rem;
  margin-top: 1rem;
  min-height: 1.2em;
`;

export const IconContainer = styled.div`
  background: ${theme.gradient.primary};
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem auto;
  animation: ${iconFloat} 5s ease-in-out infinite,
    ${iconGlow} 3s ease-in-out infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    box-shadow: ${theme.shadow.md};
  }
`;

export const ErrorText = styled(MessageText)`
  color: ${theme.color.danger};
`;

export const SuccessText = styled(MessageText)`
  color: ${theme.color.success};
`;
