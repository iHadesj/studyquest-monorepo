import { useState, useEffect } from 'react';
import {
  collection,
  doc,
  getDocs,
  query,
  where,
  runTransaction,
  arrayUnion,
  arrayRemove,
  documentId,
  getDoc,
} from 'firebase/firestore';
import { ChatCircleDots, Check, Plus, Sword, X } from 'phosphor-react';
import { z } from 'zod';
import { db, auth } from '../../config/firebase';
import { useProgressStore } from '../../hooks/useProgressStore';
import type { FirestoreUserData } from '../../hooks/useProgressStore';
import { socket } from '../../services/socket';
import * as S from './style';
import * as Modal from '../Modal/index';
import { verificarEdesbloquearConquistas } from '../../services/achievements';
import type { UserProfileData } from '../../interfaces';

const fullTagSchema = z
  .string()
  .trim()
  .min(1, 'A tag não pode ser vazia.')
  .regex(/^.+#\d{4}$/, 'A tag precisa estar no formato "nome#1234".');

interface FriendsListProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenChat: (friend: UserProfileData) => void;
  onViewProfile: (user: UserProfileData) => void;
}

type ActiveTab = 'friends' | 'requests' | 'sent';

type FeedbackModalState = {
  isOpen: boolean;
  message: string;
  type: 'success' | 'error';
};

export function FriendsList({
  isOpen,
  onClose,
  onOpenChat,
  onViewProfile,
}: FriendsListProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('friends');
  const [friendsDetails, setFriendsDetails] = useState<UserProfileData[]>([]);
  const [requestsDetails, setRequestsDetails] = useState<UserProfileData[]>([]);
  const [sentRequestsDetails, setSentRequestsDetails] = useState<
    UserProfileData[]
  >([]);
  const [onlineFriends, setOnlineFriends] = useState<string[]>([]);
  const [fullTagInput, setFullTagInput] = useState('');
  const [feedbackModal, setFeedbackModal] = useState<FeedbackModalState>({
    isOpen: false,
    message: '',
    type: 'success',
  });

  const currentUser = useProgressStore((state) => state);

  useEffect(() => {
    if (!isOpen) return;

    const fetchUserDetails = async (
      uids: string[]
    ): Promise<UserProfileData[]> => {
      if (!uids || uids.length === 0) return [];
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where(documentId(), 'in', uids));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => {
        const data = doc.data() as FirestoreUserData;
        return { ...data, uid: doc.id, level: 0, rank: undefined };
      });
    };

    const fetchAllDetails = async () => {
      const friendUIDs = currentUser.friends || [];
      const requestUIDs = currentUser.friendRequestsReceived || [];
      const sentUIDs = currentUser.friendRequestsSent || [];

      const [friendData, requestData, sentData] = await Promise.all([
        fetchUserDetails(friendUIDs),
        fetchUserDetails(requestUIDs),
        fetchUserDetails(sentUIDs),
      ]);

      setFriendsDetails(friendData);
      setRequestsDetails(requestData);
      setSentRequestsDetails(sentData);
    };

    fetchAllDetails();
  }, [
    isOpen,
    currentUser.friends,
    currentUser.friendRequestsReceived,
    currentUser.friendRequestsSent,
  ]);

  useEffect(() => {
    if (!isOpen || friendsDetails.length === 0) {
      setOnlineFriends([]);
      return;
    }

    const friendTags = friendsDetails
      .map((f) => f.fullTag)
      .filter(Boolean) as string[];

    const handleInitialStatus = (initialOnlineFriends: string[]) => {
      setOnlineFriends(initialOnlineFriends);
    };

    const handleStatusUpdate = ({
      tag,
      status,
    }: {
      tag: string;
      status: 'online' | 'offline';
    }) => {
      setOnlineFriends((prevOnlineFriends) => {
        const newSet = new Set(prevOnlineFriends);
        if (status === 'online') newSet.add(tag);
        else newSet.delete(tag);
        return Array.from(newSet);
      });
    };

    socket.on('initial_friends_status', handleInitialStatus);
    socket.on('friend_status_update', handleStatusUpdate);
    socket.emit('subscribe_to_friends_status', { friendTags });

    return () => {
      socket.emit('unsubscribe_from_friends_status', { friendTags });
      socket.off('initial_friends_status', handleInitialStatus);
      socket.off('friend_status_update', handleStatusUpdate);
    };
  }, [isOpen, friendsDetails]);

  const refreshCurrentUserState = async () => {
    const user = auth.currentUser;
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        useProgressStore
          .getState()
          .hydrateFromFirestore(userDoc.data() as FirestoreUserData);
      }
    }
  };

  const handleSendFriendRequest = async (targetUserId: string) => {
    const currentUserId = auth.currentUser?.uid;
    if (!currentUserId) return;
    try {
      await runTransaction(db, async (transaction) => {
        const currentUserRef = doc(db, 'users', currentUserId);
        const targetUserRef = doc(db, 'users', targetUserId);
        transaction.update(currentUserRef, {
          friendRequestsSent: arrayUnion(targetUserId),
        });
        transaction.update(targetUserRef, {
          friendRequestsReceived: arrayUnion(currentUserId),
        });
      });
      await refreshCurrentUserState();
    } catch (e) {
      console.error('Erro ao enviar pedido de amizade:', e);
    }
  };

  const handleSendRequestByTag = async (event: React.FormEvent) => {
    event.preventDefault();
    const currentUserId = auth.currentUser?.uid;
    if (!currentUserId) return;

    const validation = fullTagSchema.safeParse(fullTagInput);
    if (!validation.success) {
      setFeedbackModal({
        isOpen: true,
        message: validation.error.issues[0].message,
        type: 'error',
      });
      return;
    }
    const targetTag = validation.data;

    if (targetTag === currentUser.fullTag) {
      setFeedbackModal({
        isOpen: true,
        message: 'Você não pode adicionar a si mesmo.',
        type: 'error',
      });
      return;
    }

    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('fullTag', '==', targetTag));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setFeedbackModal({
          isOpen: true,
          message: 'Jogador não encontrado.',
          type: 'error',
        });
        return;
      }

      const targetUserDoc = querySnapshot.docs[0];
      const targetUserId = targetUserDoc.id;

      if (currentUser.friends?.includes(targetUserId)) {
        setFeedbackModal({
          isOpen: true,
          message: 'Vocês já são amigos.',
          type: 'error',
        });
        return;
      }
      if (currentUser.friendRequestsSent?.includes(targetUserId)) {
        setFeedbackModal({
          isOpen: true,
          message: 'Você já enviou um convite para este jogador.',
          type: 'error',
        });
        return;
      }

      await handleSendFriendRequest(targetUserId);
      setFullTagInput('');
      setFeedbackModal({
        isOpen: true,
        message: 'Convite enviado com sucesso!',
        type: 'success',
      });
    } catch (error) {
      console.error('Erro ao procurar ou enviar convite:', error);
      setFeedbackModal({
        isOpen: true,
        message: 'Ocorreu um erro. Tente novamente.',
        type: 'error',
      });
    }
  };

  const handleRequest = async (requesterId: string, accept: boolean) => {
    const currentUserId = auth.currentUser?.uid;
    if (!currentUserId) return;
    try {
      await runTransaction(db, async (transaction) => {
        const currentUserRef = doc(db, 'users', currentUserId);
        const requesterRef = doc(db, 'users', requesterId);
        transaction.update(currentUserRef, {
          friendRequestsReceived: arrayRemove(requesterId),
        });
        transaction.update(requesterRef, {
          friendRequestsSent: arrayRemove(currentUserId),
        });
        if (accept) {
          transaction.update(currentUserRef, {
            friends: arrayUnion(requesterId),
          });
          transaction.update(requesterRef, {
            friends: arrayUnion(currentUserId),
          });
        }
      });
      await refreshCurrentUserState();
      if (accept) {
        verificarEdesbloquearConquistas('ADICIONOU_AMIGO', {});
      }
    } catch (e) {
      console.error('Erro ao responder ao pedido:', e);
    }
  };

  const handleInvite = (friendTag: string | undefined) => {
    if (!friendTag) return;
    socket.emit('invite_player', { inviteeTag: friendTag });
    onClose();
  };

  const devTag = 'Edu.dev#8636';
  const getAvatarSrc = (user: UserProfileData) => {
    return user.fullTag === devTag
      ? '/Light.jpg'
      : `https://api.dicebear.com/8.x/pixel-art/svg?seed=${user.avatarSeed}`;
  };

  return (
    <>
      <Modal.Root isOpen={isOpen} onClose={onClose}>
        <Modal.Overlay />
        <Modal.Content>
          <Modal.Header>
            <Modal.Title style={{ fontSize: '1.5rem' }}>Amigos</Modal.Title>
            <Modal.Close />
          </Modal.Header>
          <S.FriendsListWrapper>
            <S.TabContainer>
              <S.TabButton
                isActive={activeTab === 'friends'}
                onClick={() => setActiveTab('friends')}
              >
                Amigos ({friendsDetails.length})
              </S.TabButton>
              <S.TabButton
                isActive={activeTab === 'requests'}
                onClick={() => setActiveTab('requests')}
              >
                Pedidos ({requestsDetails.length})
              </S.TabButton>
              <S.TabButton
                isActive={activeTab === 'sent'}
                onClick={() => setActiveTab('sent')}
              >
                Enviados ({sentRequestsDetails.length})
              </S.TabButton>
            </S.TabContainer>
            <S.List>
              {activeTab === 'friends' &&
                (friendsDetails.length > 0 ? (
                  friendsDetails.map((friend) => {
                    const isOnline = friend.fullTag
                      ? onlineFriends.includes(friend.fullTag)
                      : false;
                    return (
                      <S.UserEntry key={friend.uid}>
                        <S.Avatar
                          src={getAvatarSrc(friend)}
                          onClick={() => onViewProfile(friend)}
                          style={{ cursor: 'pointer' }}
                        />
                        <S.UserInfo
                          onClick={() => onViewProfile(friend)}
                          style={{ cursor: 'pointer' }}
                        >
                          <S.Username>{friend.username}</S.Username>
                          <S.Status isOnline={isOnline}>
                            {isOnline ? 'Online' : 'Offline'}
                          </S.Status>
                        </S.UserInfo>
                        <S.ActionButtons>
                          <S.ActionButton
                            variant="chat"
                            onClick={() => onOpenChat(friend)}
                            title="Abrir Chat"
                          >
                            <ChatCircleDots size={18} />
                          </S.ActionButton>
                          <S.ActionButton
                            variant="invite"
                            onClick={() => handleInvite(friend.fullTag)}
                            disabled={!isOnline}
                            title="Convidar para Duelo"
                          >
                            <Sword size={18} />
                          </S.ActionButton>
                        </S.ActionButtons>
                      </S.UserEntry>
                    );
                  })
                ) : (
                  <S.EmptyState>
                    Você ainda não tem amigos. Adicione alguns!
                  </S.EmptyState>
                ))}

              {activeTab === 'requests' &&
                (requestsDetails.length > 0 ? (
                  requestsDetails.map((request) => (
                    <S.UserEntry key={request.uid}>
                      <S.Avatar
                        src={getAvatarSrc(request)}
                        onClick={() => onViewProfile(request)}
                        style={{ cursor: 'pointer' }}
                      />
                      <S.UserInfo
                        onClick={() => onViewProfile(request)}
                        style={{ cursor: 'pointer' }}
                      >
                        <S.Username>{request.username}</S.Username>
                      </S.UserInfo>
                      <S.ActionButtons>
                        <S.ActionButton
                          variant="accept"
                          onClick={() => handleRequest(request.uid, true)}
                          title="Aceitar Pedido"
                        >
                          <Check size={18} />
                        </S.ActionButton>
                        <S.ActionButton
                          variant="decline"
                          onClick={() => handleRequest(request.uid, false)}
                          title="Recusar Pedido"
                        >
                          <X size={18} />
                        </S.ActionButton>
                      </S.ActionButtons>
                    </S.UserEntry>
                  ))
                ) : (
                  <S.EmptyState>
                    Nenhum pedido de amizade pendente.
                  </S.EmptyState>
                ))}

              {activeTab === 'sent' &&
                (sentRequestsDetails.length > 0 ? (
                  sentRequestsDetails.map((user) => (
                    <S.UserEntry key={user.uid}>
                      <S.Avatar
                        src={getAvatarSrc(user)}
                        onClick={() => onViewProfile(user)}
                        style={{ cursor: 'pointer' }}
                      />
                      <S.UserInfo
                        onClick={() => onViewProfile(user)}
                        style={{ cursor: 'pointer' }}
                      >
                        <S.Username>{user.username}</S.Username>
                        <S.Status isOnline={false}>Pendente</S.Status>
                      </S.UserInfo>
                    </S.UserEntry>
                  ))
                ) : (
                  <S.EmptyState>Nenhum convite enviado.</S.EmptyState>
                ))}
            </S.List>
          </S.FriendsListWrapper>
          <S.FooterContainer as="form" onSubmit={handleSendRequestByTag}>
            <S.AddFriendInput
              type="text"
              placeholder="Nome#1234"
              value={fullTagInput}
              onChange={(e) => setFullTagInput(e.target.value)}
            />
            <S.FriendActionButton type="submit">
              Adicionar <Plus size={18} style={{ marginLeft: '0.25rem' }} />
            </S.FriendActionButton>
          </S.FooterContainer>
        </Modal.Content>
      </Modal.Root>

      <Modal.Root
        isOpen={feedbackModal.isOpen}
        onClose={() => setFeedbackModal({ ...feedbackModal, isOpen: false })}
      >
        <Modal.Overlay />
        <Modal.Content>
          <Modal.Header>
            <Modal.Title>
              {feedbackModal.type === 'success' ? 'Sucesso!' : 'Opa!'}
            </Modal.Title>
            <Modal.Close />
          </Modal.Header>
          <p style={{ padding: '1rem 1.5rem', lineHeight: 1.5 }}>
            {feedbackModal.message}
          </p>
        </Modal.Content>
      </Modal.Root>
    </>
  );
}
