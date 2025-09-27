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

  const chatId = [myUid, friend.uid].sort().join('_');

  useEffect(() => {
    if (!chatId) return;
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'), limit(50));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const msgs = querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Message)
      );
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
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
        {messages.map((msg) => (
          <S.MessageBubble key={msg.id} $isMe={msg.senderId === myUid}>
            {msg.text}
          </S.MessageBubble>
        ))}
        <div ref={messagesEndRef} />
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
