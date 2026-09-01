// src/components/ChatWindow/style.ts
import styled from 'styled-components';
import { theme } from '../../style/theme';

export const ChatWrapper = styled.div`
  position: fixed;
  bottom: 0;
  right: 2rem;
  width: 320px;
  background-color: ${theme.color.bgRaised};
  border-radius: 8px 8px 0 0;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  height: 400px;
  z-index: 1001;
`;

export const ChatHeader = styled.div`
  background-color: ${theme.color.bgDeep};
  padding: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid ${theme.color.stroke};
  border-radius: 8px 8px 0 0;

  p {
    margin: 0;
    color: #ffffff;
    font-weight: bold;
  }
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  width: 50px;
  height: 30px;
  color: ${theme.color.textMuted};
  cursor: pointer;
  font-size: 1.25rem;
  line-height: 1;
  &:hover {
    color: #ffffff;
  }
`;

export const MessagesContainer = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;

  & > :first-child {
    margin-top: auto;
  }
`;

export const MessageBubble = styled.div<{ $isMe: boolean }>`
  background-color: ${({ $isMe }) => ($isMe ? theme.color.primary : theme.color.bg)};
  align-self: ${({ $isMe }) => ($isMe ? 'flex-end' : 'flex-start')};
  color: ${theme.color.text};
  padding: 0.5rem 0.75rem;
  user-select: text;
  border-radius: 12px;
  max-width: 80%;
  margin-top: 0.5rem;
  word-wrap: break-word;
`;

export const ChatInputForm = styled.form`
  display: flex;
  padding: 0.75rem;
  border-top: 1px solid ${theme.color.stroke};
  align-items: center;
  gap: 0.5rem;
`;

export const ChatInput = styled.input`
  flex-grow: 1;
  background-color: ${theme.color.stroke};
  border: none;
  border-radius: 20px;
  padding: 0.5rem 1rem;
  color: ${theme.color.text};
  outline: none;
`;

// 3. ESTILO DO NOSSO NOVO BOTÃO DE ENVIO
export const SendButton = styled.button`
  background-color: ${theme.color.primary};
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: background-color 0.2s;
  flex-shrink: 0; /* Impede que o botão encolha */

  &:hover {
    background-color: ${theme.color.primary};
  }

  &:disabled {
    background-color: ${theme.color.stroke};
    cursor: not-allowed;
    color: ${theme.color.textFaint};
  }
`;
