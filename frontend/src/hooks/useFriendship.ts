import {
  doc,
  runTransaction,
  arrayUnion,
  arrayRemove,
  getDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useProgressStore, type FirestoreUserData } from './useProgressStore';
import { verificarEdesbloquearConquistas } from '../services/achievements';

export function useFriendship(targetUserId: string | null) {
  const currentUser = useProgressStore((state) => state);
  const currentUserId = currentUser.uid;

  const friendshipStatus = (() => {
    if (!targetUserId || !currentUserId || targetUserId === currentUserId)
      return 'MYSELF';
    if (currentUser.friends?.includes(targetUserId)) return 'FRIENDS';
    if (currentUser.friendRequestsSent?.includes(targetUserId)) return 'SENT';
    if (currentUser.friendRequestsReceived?.includes(targetUserId))
      return 'RECEIVED';
    return 'NONE';
  })();

  const refreshCurrentUserState = async () => {
    if (currentUserId) {
      const userDocRef = doc(db, 'users', currentUserId);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        useProgressStore
          .getState()
          .hydrateFromFirestore(userDoc.data() as FirestoreUserData);
      }
    }
  };

  const sendRequest = async () => {
    if (friendshipStatus !== 'NONE' || !currentUserId || !targetUserId) return;
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
  };

  const cancelRequest = async () => {
    if (friendshipStatus !== 'SENT' || !currentUserId || !targetUserId) return;
    await runTransaction(db, async (transaction) => {
      const currentUserRef = doc(db, 'users', currentUserId);
      const targetUserRef = doc(db, 'users', targetUserId);
      transaction.update(currentUserRef, {
        friendRequestsSent: arrayRemove(targetUserId),
      });
      transaction.update(targetUserRef, {
        friendRequestsReceived: arrayRemove(currentUserId),
      });
    });
    await refreshCurrentUserState();
  };

  const handleRequest = async (accept: boolean) => {
    if (friendshipStatus !== 'RECEIVED' || !currentUserId || !targetUserId)
      return;
    await runTransaction(db, async (transaction) => {
      const currentUserRef = doc(db, 'users', currentUserId);
      const requesterRef = doc(db, 'users', targetUserId);
      transaction.update(currentUserRef, {
        friendRequestsReceived: arrayRemove(targetUserId),
      });
      transaction.update(requesterRef, {
        friendRequestsSent: arrayRemove(currentUserId),
      });
      if (accept) {
        transaction.update(currentUserRef, {
          friends: arrayUnion(targetUserId),
        });
        transaction.update(requesterRef, {
          friends: arrayUnion(currentUserId),
        });
      }
    });
    await refreshCurrentUserState();
    if (accept) {
      verificarEdesbloquearConquistas('ADICIONOU_AMIGO');
    }
  };

  return { friendshipStatus, sendRequest, cancelRequest, handleRequest };
}
