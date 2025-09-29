import { useState, useEffect } from 'react';
import {
  collection,
  getDocs,
  query,
  where,
  documentId,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import {
  useProgressStore,
  type FirestoreUserData,
} from '../../hooks/useProgressStore';
import { socket } from '../../services/socket';
import * as Modal from '../Modal';
import * as S from './style';
import type { UserProfileData } from '../../interfaces';
import { LoadingSpinner } from '../../style/globalStyle';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InviteModal({ isOpen, onClose }: InviteModalProps) {
  const [tag, setTag] = useState('');
  const [friendsDetails, setFriendsDetails] = useState<UserProfileData[]>([]);
  const [onlineFriends, setOnlineFriends] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { friends: friendUIDs, fullTag: myTag } = useProgressStore();

  useEffect(() => {
    if (!isOpen) return;

    const fetchAndSubscribe = async () => {
      setIsLoading(true);

      // 1. Buscar detalhes dos amigos no Firestore
      let fetchedFriends: UserProfileData[] = [];
      if (friendUIDs && friendUIDs.length > 0) {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where(documentId(), 'in', friendUIDs));
        const querySnapshot = await getDocs(q);
        fetchedFriends = querySnapshot.docs.map((doc) => {
          const data = doc.data() as FirestoreUserData;
          return { ...data, uid: doc.id, level: 0, rank: undefined };
        });
      }
      setFriendsDetails(fetchedFriends);

      // 2. Com os detalhes em mãos, se inscrever no status online via Socket
      const friendTags = fetchedFriends
        .map((f) => f.fullTag)
        .filter(Boolean) as string[];
      if (friendTags.length > 0) {
        socket.emit('subscribe_to_friends_status', { friendTags });
      }

      setIsLoading(false);
    };

    fetchAndSubscribe();

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
      setOnlineFriends((prev) => {
        const newSet = new Set(prev);
        if (status === 'online') newSet.add(tag);
        else newSet.delete(tag);
        return Array.from(newSet);
      });
    };

    socket.on('initial_friends_status', handleInitialStatus);
    socket.on('friend_status_update', handleStatusUpdate);

    return () => {
      const friendTags = friendsDetails
        .map((f) => f.fullTag)
        .filter(Boolean) as string[];
      if (friendTags.length > 0) {
        socket.emit('unsubscribe_from_friends_status', { friendTags });
      }
      socket.off('initial_friends_status', handleInitialStatus);
      socket.off('friend_status_update', handleStatusUpdate);
    };
  }, [isOpen, friendUIDs]);

  const handleInvite = (inviteeTag: string) => {
    if (!inviteeTag.trim() || !inviteeTag.includes('#')) {
      alert('Por favor, digite ou selecione uma tag válida (ex: Nome#1234)');
      return;
    }
    if (inviteeTag === myTag) {
      alert('Você não pode convidar a si mesmo!');
      return;
    }

    socket.emit('invite_player', { inviteeTag });
    console.log(`Enviando convite para o jogador: ${inviteeTag}`);
    onClose();
  };

  const onlineFriendsDetails = friendsDetails.filter(
    (friend) => friend.fullTag && onlineFriends.includes(friend.fullTag)
  );

  const devTag = 'Edu.dev#8636';
  const getAvatarSrc = (user: UserProfileData) => {
    return user.fullTag === devTag
      ? '/Light.jpg'
      : `https://api.dicebear.com/8.x/pixel-art/svg?seed=${user.avatarSeed}`;
  };

  return (
    <Modal.Root isOpen={isOpen} onClose={onClose}>
      <Modal.Overlay />
      <Modal.Content>
        <Modal.Header>
          <Modal.Title>Convidar para Duelo</Modal.Title>
          <Modal.Close />
        </Modal.Header>
        <Modal.Body>
          <S.InviteBox>
            <p>Digite a tag do seu oponente (ex: Nome#1234)</p>
            <S.TagInput
              type="text"
              placeholder="Nome#1234"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
            />
            <S.InviteButton
              onClick={() => handleInvite(tag)}
              disabled={!tag.trim()}
            >
              Enviar Convite por Tag
            </S.InviteButton>

            <S.Separator>OU</S.Separator>

            <h4>Convide um amigo online:</h4>

            {isLoading ? (
              <LoadingSpinner style={{ margin: '2rem auto' }} />
            ) : (
              <S.FriendList>
                {onlineFriendsDetails.length > 0 ? (
                  onlineFriendsDetails.map((friend) => (
                    <S.FriendEntry key={friend.uid}>
                      <S.Avatar src={getAvatarSrc(friend)} />
                      <S.UserInfo>{friend.username}</S.UserInfo>
                      <S.InviteButton
                        onClick={() => handleInvite(friend.fullTag!)}
                      >
                        Convidar
                      </S.InviteButton>
                    </S.FriendEntry>
                  ))
                ) : (
                  <S.EmptyState>Nenhum amigo online no momento.</S.EmptyState>
                )}
              </S.FriendList>
            )}
          </S.InviteBox>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
}
