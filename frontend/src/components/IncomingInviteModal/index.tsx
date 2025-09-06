import React from 'react';
import { socket } from '../../services/socket';
import * as Modal from '../Modal';
import { InviteBox, ButtonGroup, ActionButton, InviterTag } from './style';

interface IncomingInviteModalProps {
  isOpen: boolean;
  inviterTag: string | null;
  onClose: () => void;
}

export function IncomingInviteModal({
  isOpen,
  inviterTag,
  onClose,
}: IncomingInviteModalProps) {
  const handleResponse = (accepted: boolean) => {
    if (!inviterTag) return;

    // Emite o evento de resposta para o servidor
    socket.emit('invite_response', {
      inviterTag,
      accepted,
    });
    onClose(); // Fecha o modal depois de responder
  };

  return (
    <Modal.Root isOpen={isOpen} onClose={onClose}>
      <Modal.Overlay />
      <Modal.Content>
        <Modal.Header>
          <Modal.Title>Você foi Desafiado!</Modal.Title>
          <Modal.Close />
        </Modal.Header>
        <Modal.Body>
          <InviteBox>
            <p>
              O jogador <InviterTag>{inviterTag}</InviterTag> quer um duelo no
              Brainstorm.
            </p>
            <p>Você aceita o desafio?</p>
            <ButtonGroup>
              <ActionButton onClick={() => handleResponse(false)}>
                Recusar
              </ActionButton>
              <ActionButton accept onClick={() => handleResponse(true)}>
                Aceitar
              </ActionButton>
            </ButtonGroup>
          </InviteBox>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
}
