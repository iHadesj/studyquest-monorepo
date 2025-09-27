// src/components/ChatWindow/index.tsx
import { useState, useEffect, useRef } from 'react';
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useProgressStore } from '../../hooks/useProgressStore';
import { socket } from '../../services/socket';
import * as S from './style';
import { PaperPlaneRight } from 'phosphor-react';

// Tipo para os detalhes do amigo com quem estamos conversando
type FriendDetails = {
  uid: string;
  username: string;
  fullTag: string;
};

// Tipo para cada mensagem
interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Timestamp | null;
}

interface ChatWindowProps {
  friend: FriendDetails;
  onClose: () => void;
}

export function ChatWindow({ friend, onClose }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { uid: myUid, fullTag: myTag } = useProgressStore();

  // Gera o ID do chat padronizado
  const chatId = [myUid, friend.uid].sort().join('_');

  useEffect(() => {
    if (!chatId) return;

    // Query para buscar as últimas 25 mensagens do histórico
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(25));

    // onSnapshot "escuta" por mudanças no banco em tempo real
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const msgs = querySnapshot.docs
        .map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as Message)
        )
        .reverse(); // Invertemos pra ordem ficar correta (mais antigas primeiro)
      setMessages(msgs);
    });

    return () => unsubscribe(); // Limpa o listener ao desmontar o componente
  }, [chatId]);

  useEffect(() => {
    const handleNewMessage = (message: any) => {
      // Checa se a mensagem pertence a este chat aberto
      if (message.chatId === chatId) {
        setMessages((prevMessages) => [...prevMessages, message]);
      }
    };

    socket.on('new_message', handleNewMessage);
    return () => {
      socket.off('new_message', handleNewMessage);
    };
  }, [chatId]);

  // Rola pra baixo automaticamente quando chegam novas mensagens
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !myTag) return;

    socket.emit('private_message', {
      recipientTag: friend.fullTag,
      messageText: newMessage.trim(),
    });

    setNewMessage('');
  };

  return (
    <S.ChatWrapper>
      <S.ChatHeader>
        <p>{friend.username}</p>
        <S.CloseButton onClick={onClose}>&times;</S.CloseButton>
      </S.ChatHeader>
      <S.MessagesContainer>
        <div ref={messagesEndRef} />
        {messages.map((msg) => (
          <S.MessageBubble key={msg.id} $isMe={msg.senderId === myUid}>
            {msg.text}
          </S.MessageBubble>
        ))}
      </S.MessagesContainer>
      <S.ChatInputForm onSubmit={handleSendMessage}>
        <S.ChatInput
          type="text"
          placeholder="Digite uma mensagem..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <S.SendButton type="submit" disabled={!newMessage.trim()}>
          <PaperPlaneRight weight="fill" />
        </S.SendButton>
      </S.ChatInputForm>
    </S.ChatWrapper>
  );
}
