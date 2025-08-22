import styled, { keyframes } from 'styled-components';
import { X } from 'phosphor-react';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translate(-50%, -48%) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
`;

export const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 1000;
`;

export const ModalContent = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  background-color: #2f3136;
  border-radius: 8px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
  padding: 1.5rem;
  width: 100%;
  z-index: 1000;
  max-width: 500px;
  animation: ${fadeIn} 0.2s ease-out;

  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

export const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  color: #ffffff;
`;

export const ModalBody = styled.div`
  color: #dcddde;
  font-size: 1rem;
  line-height: 1.5;
`;

export const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;

  background: transparent;
  border: none;
  cursor: pointer;
  color: #b9bbbe;

  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #ff0000ff;
  }
`;

export const CloseIcon = styled(X).attrs({
  size: 24,
  weight: 'bold',
})``;
