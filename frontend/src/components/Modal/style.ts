import styled, { keyframes } from 'styled-components';
import { X } from 'phosphor-react';
import { theme } from '../../style/theme';

const overlayIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

const contentIn = keyframes`
  from {
    opacity: 0;
    transform: translate(-50%, -46%) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
`;

export const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(4, 4, 10, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  z-index: 1000;
  animation: ${overlayIn} 220ms ${theme.ease.out};
`;

export const ModalContent = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  background: linear-gradient(
    160deg,
    rgba(30, 30, 48, 0.96) 0%,
    rgba(16, 16, 28, 0.96) 100%
  );
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid ${theme.color.strokeStrong};
  border-radius: ${theme.radius.xl};
  box-shadow: ${theme.shadow.lg};
  padding: 1.75rem;
  width: 100%;
  max-width: 520px;
  max-height: 85vh;
  overflow-y: auto;
  z-index: 1000;
  animation: ${contentIn} 320ms ${theme.ease.bounce};

  display: flex;
  flex-direction: column;
  gap: 1.25rem;

  /* Fio de luz no topo, marcando a borda superior da folha. */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 14%;
    right: 14%;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      ${theme.color.primarySoft},
      transparent
    );
  }

  @media (max-width: 768px) {
    width: calc(100% - 2rem);
    padding: 1.35rem;
  }
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  width: 100%;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${theme.color.stroke};
`;

export const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  letter-spacing: -0.4px;
  color: ${theme.color.text};
`;

export const ModalBody = styled.div`
  color: ${theme.color.textMuted};
  font-size: 0.95rem;
  line-height: 1.6;
`;

export const CloseButton = styled.button`
  position: absolute;
  top: 1.1rem;
  right: 1.1rem;
  background: ${theme.color.glass};
  border: 1px solid ${theme.color.stroke};
  border-radius: 50%;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${theme.color.textMuted};
  z-index: 10;
  transition: color 200ms ease, background 200ms ease, border-color 200ms ease,
    transform 240ms ${theme.ease.bounce};

  &:hover {
    background: rgba(251, 113, 133, 0.12);
    border-color: rgba(251, 113, 133, 0.4);
    color: ${theme.color.danger};
    transform: rotate(90deg);
  }
`;

export const CloseIcon = styled(X).attrs({
  size: 18,
  weight: 'bold',
})``;
