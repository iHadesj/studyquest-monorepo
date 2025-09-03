// src/components/InviteModal/index.tsx
import { useState } from 'react';
import styled from 'styled-components';
import * as Modal from '../Modal';

const InviteBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  text-align: center;
`;

const TagInput = styled.input`
  width: 95%;
  padding: 0.75rem;
  background-color: #202225;
  border: 1px solid #40444b;
  border-radius: 4px;
  color: #dcddde;
  font-family: 'Fira Code', monospace;
  font-size: 1.2rem;
  text-align: center;
  &:focus {
    outline: none;
    border-color: #5865f2;
  }
`;

const InviteButton = styled.button`
  background-color: #43b581;
  color: #ffffff;
  font-weight: bold;
  padding: 0.75rem 2rem;
  border-radius: 4px;
  font-size: 1.1rem;
  border: none;
  cursor: pointer;
  &:hover {
    background-color: #3aa570;
  }
`;

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InviteModal({ isOpen, onClose }: InviteModalProps) {
  const [tag, setTag] = useState('');

  const handleInvite = () => {
    if (!tag.trim() || !tag.includes('#')) {
      alert('Por favor, digite uma tag válida (ex: Nome#1234)');
      return;
    }
    // AQUI A GENTE USA O WEBSOCKET
    socket.emit('invite_player', { inviteeTag: tag });

    console.log(`Enviando convite para o jogador: ${tag}`);
    onClose();
  };

  return (
    <Modal.Root isOpen={isOpen} onClose={onClose}>
      <Modal.Overlay />
      <Modal.Content>
        <Modal.Header>
          <Modal.Title>Convidar para Brainstorm</Modal.Title>
          <Modal.Close />
        </Modal.Header>
        <Modal.Body>
          <InviteBox>
            <p>Digite a tag do seu oponente (ex: Nome#1234)</p>
            <TagInput
              type="text"
              placeholder="Nome#1234"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
            />
            <InviteButton onClick={handleInvite}>Enviar Convite</InviteButton>
          </InviteBox>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
}
