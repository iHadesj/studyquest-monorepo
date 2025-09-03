import React, { createContext, useContext, useRef } from 'react';
import {
  ModalOverlay,
  ModalContent,
  ModalHeader as StyledHeader,
  ModalTitle as StyledTitle,
  ModalBody as StyledBody,
  CloseButton,
  CloseIcon,
} from './style';

// --- Tipos e Contexto ---
interface ModalContextType {
  onClose: () => void;
}

const ModalContext = createContext<ModalContextType | null>(null);

const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal só pode ser usado dentro de um Modal.Root');
  }
  return context;
};

// --- Componentes do "Lego" ---

interface RootProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function Root({ isOpen, onClose, children }: RootProps) {
  if (!isOpen) return null;

  return (
    <ModalContext.Provider value={{ onClose }}>
      {children}
    </ModalContext.Provider>
  );
}

export function Overlay() {
  const { onClose } = useModal();
  return <ModalOverlay onClick={onClose} />;
}

interface ContentProps {
  children: React.ReactNode;
}

export function Content({ children }: ContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <ModalContent ref={contentRef} onClick={handleContentClick}>
      {children}
    </ModalContent>
  );
}

export function Close() {
  const { onClose } = useModal();
  return (
    <CloseButton onClick={onClose} aria-label="Fechar modal">
      <CloseIcon />
    </CloseButton>
  );
}

export const Header = StyledHeader;
export const Title = StyledTitle;
export const Body = StyledBody;

// --- Exemplo de como usar ---
/*
import { useState } from 'react';
// A única mudança é aqui no import!
import * as Modal from './components/Modal'; 

function MeuComponente() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsModalOpen(true)}>Abrir Modal</button>

      <Modal.Root isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Modal.Overlay />
        <Modal.Content>
          <Modal.Header>
            <Modal.Title>Título do Modal</Modal.Title>
            <Modal.Close />
          </Modal.Header>
          <Modal.Body>
            <p>Aqui vai qualquer coisa que tu quiser. Um formulário, um texto, uma imagem...</p>
          </Modal.Body>
        </Modal.Content>
      </Modal.Root>
    </>
  );
}
*/
