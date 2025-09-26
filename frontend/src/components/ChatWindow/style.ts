// src/components/ChatWindow/style.ts
import styled from 'styled-components';

export const ChatWrapper = styled.div`
  position: fixed;
  bottom: 0;
  right: 2rem;
  width: 320px;
  background-color: #2f3136;
  border-radius: 8px 8px 0 0;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  height: 400px;
  z-index: 1001;
`;

export const ChatHeader = styled.div`
  background-color: #202225;
  padding: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #40444b;
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
  color: #b9bbbe;
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
  flex-direction: column-reverse; // Mensagens novas aparecem embaixo
`;

export const MessageBubble = styled.div<{ $isMe: boolean }>`
  background-color: ${({ $isMe }) => ($isMe ? '#5865f2' : '#36393f')};
  align-self: ${({ $isMe }) => ($isMe ? 'flex-end' : 'flex-start')};
  color: #dcddde;
  padding: 0.5rem 0.75rem;
  border-radius: 12px;
  max-width: 80%;
  margin-bottom: 0.5rem;
  word-wrap: break-word;
`;

export const ChatInputForm = styled.form`
  display: flex;
  padding: 0.75rem;
  border-top: 1px solid #40444b;
`;

export const ChatInput = styled.input`
  flex-grow: 1;
  background-color: #40444b;
  border: none;
  border-radius: 20px;
  padding: 0.5rem 1rem;
  color: #dcddde;
  outline: none;
`;
