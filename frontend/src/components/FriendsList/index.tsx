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
import { Check, Sword, X } from 'phosphor-react';
import { db, auth } from '../../config/firebase';
import { useProgressStore } from '../../hooks/useProgressStore';
import type { FirestoreUserData } from '../../hooks/useProgressStore';
import { socket } from '../../services/socket';
import * as Modal from '../Modal';
import * as S from './style';

interface FriendsListProps {
  isOpen: boolean;
  onClose: () => void;
}

type UserDetails = {
  uid: string;
  username: string;
  avatarSeed: string;
  fullTag: string;
};

export function FriendsList({ isOpen, onClose }: FriendsListProps) {
  const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('friends');
  const [friendsDetails, setFriendsDetails] = useState<UserDetails[]>([]);
  const [requestsDetails, setRequestsDetails] = useState<UserDetails[]>([]);
  const [onlineFriends, setOnlineFriends] = useState<string[]>([]);

  const currentUser = useProgressStore((state) => state);

  useEffect(() => {
    if (!isOpen) return;

    const fetchUserDetails = async (uids: string[]): Promise<UserDetails[]> => {
      if (!uids || uids.length === 0) return [];
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where(documentId(), 'in', uids));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => doc.data() as UserDetails);
    };

    const fetchFriendsAndRequests = async () => {
      const friendUIDs = currentUser.friends || [];
      const requestUIDs = currentUser.friendRequestsReceived || [];

      const [friendData, requestData] = await Promise.all([
        fetchUserDetails(friendUIDs),
        fetchUserDetails(requestUIDs),
      ]);

      setFriendsDetails(friendData);
      setRequestsDetails(requestData);
    };

    fetchFriendsAndRequests();
  }, [isOpen, currentUser.friends, currentUser.friendRequestsReceived]);

  useEffect(() => {
    if (!isOpen || friendsDetails.length === 0) return;

    // Pega as tags de todos os amigos para enviar ao servidor
    const friendTags = friendsDetails.map((f) => f.fullTag);

    const onOnlineFriends = (onlineTags: string[]) => {
      setOnlineFriends(onlineTags);
    };

    // Configura o listener
    socket.on('online_friends', onOnlineFriends);

    socket.emit('get_online_friends', { friendTags });

    return () => {
      socket.off('online_friends', onOnlineFriends);
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
    } catch (e) {
      console.error('Erro ao responder ao pedido:', e);
    }
  };

  const handleInvite = (friendTag: string) => {
    socket.emit('invite_player', { inviteeTag: friendTag });
    onClose();
  };

  return (
    <Modal.Root isOpen={isOpen} onClose={onClose}>
      <Modal.Overlay />
      <Modal.Content>
        <Modal.Header>
          <Modal.Title>Amigos</Modal.Title>
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
          </S.TabContainer>
          <S.List>
            {activeTab === 'friends' &&
              (friendsDetails.length > 0 ? (
                friendsDetails.map((friend) => {
                  const isOnline = onlineFriends.includes(friend.fullTag);
                  return (
                    <S.UserEntry key={friend.uid}>
                      <S.Avatar
                        src={`https://api.dicebear.com/8.x/pixel-art/svg?seed=${friend.avatarSeed}`}
                      />
                      <S.UserInfo>
                        <S.Username>{friend.username}</S.Username>
                        <S.Status isOnline={isOnline}>
                          {isOnline ? 'Online' : 'Offline'}
                        </S.Status>
                      </S.UserInfo>
                      <S.ActionButtons>
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
                  Você ainda não tem amigos. Adicione alguns no ranking!
                </S.EmptyState>
              ))}
            {activeTab === 'requests' &&
              (requestsDetails.length > 0 ? (
                requestsDetails.map((request) => (
                  <S.UserEntry key={request.uid}>
                    <S.Avatar
                      src={`https://api.dicebear.com/8.x/pixel-art/svg?seed=${request.avatarSeed}`}
                    />
                    <S.UserInfo>
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
                <S.EmptyState>Nenhum pedido de amizade pendente.</S.EmptyState>
              ))}
          </S.List>
        </S.FriendsListWrapper>
      </Modal.Content>
    </Modal.Root>
  );
}
