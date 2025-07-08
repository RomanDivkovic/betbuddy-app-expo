import { useState, useEffect } from 'react';
import { firestore } from '../lib/firebase';
import { collection, query, where, getDocs, doc, writeBatch, deleteDoc } from 'firebase/firestore';
import { Invitation } from '../types';
import { useAuth } from '../context/AuthContext';

export const useInvitations = () => {
  const { currentUser: user } = useAuth();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchInvitations = async () => {
      try {
        const emailKey = user.email?.replace(/\./g, ',');
        if (!emailKey) return;

        const invitationsRef = collection(firestore, `invitationsByEmail/${emailKey}/invitations`);
        const q = query(invitationsRef);
        const querySnapshot = await getDocs(q);
        const userInvitations = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invitation));
        setInvitations(userInvitations);
      } catch (error) {
        console.error("Error fetching invitations: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvitations();
  }, [user]);

  const handleAcceptInvitation = async (invitation: Invitation) => {
    if (!user) return;
    const batch = writeBatch(firestore);

    // Add user to the group
    const groupRef = doc(firestore, 'groups', invitation.groupId);
    batch.update(groupRef, {
      members: {
        [user.uid]: {
          displayName: user.displayName,
          photoURL: user.photoURL,
        }
      }
    });

    // Add group to the user's groups subcollection
    const userGroupRef = doc(firestore, `users/${user.uid}/groups`, invitation.groupId);
    batch.set(userGroupRef, {
      groupId: invitation.groupId,
      groupName: invitation.groupName,
    });

    // Delete the invitation
    const emailKey = user.email?.replace(/\./g, ',');
    if (!emailKey) return;
    const invitationRef = doc(firestore, `invitationsByEmail/${emailKey}/invitations`, invitation.id);
    batch.delete(invitationRef);

    await batch.commit();
    setInvitations(prev => prev.filter(inv => inv.id !== invitation.id));
  };

  const handleDeclineInvitation = async (invitation: Invitation) => {
    if (!user) return;
    const emailKey = user.email?.replace(/\./g, ',');
    if (!emailKey) return;
    const invitationRef = doc(firestore, `invitationsByEmail/${emailKey}/invitations`, invitation.id);
    await deleteDoc(invitationRef);
    setInvitations(prev => prev.filter(inv => inv.id !== invitation.id));
  };

  return { invitations, loading, handleAcceptInvitation, handleDeclineInvitation };
};
