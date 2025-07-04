// Fetch all fights for a given date from the MMA API (returns array of fights or empty array)
export const fetchFightsByDate = async (date: string) => {
  try {
    const apiDate = date.split("T")[0];
    const apiData = await fetchMmaEvents(apiDate);
    return apiData.response || [];
  } catch (err) {
    console.warn("Failed to fetch fights for date", date, err);
    return [];
  }
};
// Send group invitation (reusable for web and mobile)
export const sendGroupInvitation = async (
  groupId: string,
  groupName: string,
  inviteEmail: string
) => {
  // Normalize email for Firebase key
  const emailKey = inviteEmail.replace(/\./g, ",");
  const invitationId = `${groupId}_${Date.now()}`;
  const invitation = {
    id: invitationId,
    groupId,
    groupName,
    userEmail: inviteEmail,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  const invitationRef = ref(
    db,
    `invitationsByEmail/${emailKey}/${invitationId}`
  );
  await set(invitationRef, invitation);
  // (Optional) TODO: Trigger notification here (in-app or FCM)
  return invitation;
};
// MMA API fetcher (web parity)
import { fetchMmaEvents } from "./mmaApiService";

// Fetch full event data from API by apiSlug and date, or by fight IDs (ported from web)
export const fetchEventFromApi = async (
  apiSlug: string,
  date: string,
  fightIds?: string[]
) => {
  // Always use only the date part (YYYY-MM-DD) for API
  const apiDate = date.split("T")[0];
  const apiData = await fetchMmaEvents(apiDate);
  const fights = apiData.response || [];
  let eventFights;
  if (fightIds && fightIds.length > 0) {
    eventFights = fights.filter((f: any) =>
      fightIds.includes(f.id?.toString())
    );
  } else {
    eventFights = fights.filter((f: any) => f.slug === apiSlug);
  }
  if (!eventFights.length) throw new Error("Event not found in API");
  // Map fights to matches
  const matches = eventFights.map((fight: any, idx: number) => ({
    id: fight.id?.toString() || `${apiSlug}-match${idx}`,
    eventId: apiSlug,
    fighter1: {
      id: fight.fighters?.first?.id?.toString() || "",
      name: fight.fighters?.first?.name || "",
      record: fight.fighters?.first?.record || "",
      country: fight.fighters?.first?.country || "",
    },
    fighter2: {
      id: fight.fighters?.second?.id?.toString() || "",
      name: fight.fighters?.second?.name || "",
      record: fight.fighters?.second?.record || "",
      country: fight.fighters?.second?.country || "",
    },
    status:
      fight.status?.short === "FT"
        ? "completed"
        : fight.status?.short === "LIVE"
        ? "live"
        : fight.status?.short === "CANC"
        ? "completed"
        : "upcoming",
    order: idx + 1,
  }));
  return {
    id: apiSlug,
    title: apiSlug,
    date,
    groupId: "",
    matches,
    status: "upcoming",
    createdAt: new Date().toISOString(),
  };
};

export const fetchGroupEventDetails = async (
  groupId: string,
  eventId: string
): Promise<Event | null> => {
  try {
    const eventRef = ref(db, `groups/${groupId}/events/${eventId}`);
    const snapshot = await get(eventRef);
    if (snapshot.exists()) {
      return snapshot.val() as Event;
    }
    return null;
  } catch (error) {
    console.error("Error fetching group event details:", error);
    return null;
  }
};

// Fetch user profile from database (like web)
export const fetchUserProfile = async (userId: string) => {
  try {
    const userRef = ref(db, `users/${userId}/profile`);
    const snapshot = await get(userRef);
    if (!snapshot.exists()) return null;
    return snapshot.val();
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};

// Fetch user invitations by email
export const fetchUserInvitations = async (userEmail: string) => {
  try {
    const invitationsRef = ref(
      db,
      `invitationsByEmail/${userEmail.replace(".", ",")}`
    );
    const snapshot = await get(invitationsRef);
    if (!snapshot.exists()) return [];
    const data = snapshot.val();
    return Object.values(data);
  } catch (error) {
    console.error("Error fetching user invitations:", error);
    return [];
  }
};
// Like/dislike a post (ported from web repo)
export const reactToPost = async (
  groupId: string,
  postId: string,
  reaction: "like" | "dislike"
) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("No authenticated user");

    const postRef = ref(db, `groups/${groupId}/posts/${postId}`);
    const snapshot = await get(postRef);

    if (!snapshot.exists()) {
      throw new Error("Post not found");
    }

    const post = snapshot.val();
    const likes = post.likes || [];
    const dislikes = post.dislikes || [];
    const hasLiked = likes.includes(user.uid);
    const hasDisliked = dislikes.includes(user.uid);
    let updatedLikes = [...likes];
    let updatedDislikes = [...dislikes];

    if (reaction === "like") {
      if (hasLiked) {
        updatedLikes = updatedLikes.filter((id) => id !== user.uid);
      } else {
        updatedLikes.push(user.uid);
        updatedDislikes = updatedDislikes.filter((id) => id !== user.uid);
      }
    } else if (reaction === "dislike") {
      if (hasDisliked) {
        updatedDislikes = updatedDislikes.filter((id) => id !== user.uid);
      } else {
        updatedDislikes.push(user.uid);
        updatedLikes = updatedLikes.filter((id) => id !== user.uid);
      }
    }

    await update(postRef, {
      likes: updatedLikes,
      dislikes: updatedDislikes,
    });

    return {
      ...post,
      likes: updatedLikes,
      dislikes: updatedDislikes,
    };
  } catch (error) {
    console.error("Error reacting to post:", error);
    throw error;
  }
};
import { auth, db } from "../lib/firebase";
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";
import {
  ref,
  get,
  set,
  push,
  update,
  remove,
  onValue,
  off,
} from "firebase/database";
import {
  Group,
  Event,
  Prediction,
  Post,
  Invitation,
  Match,
  LeaderboardEntry,
  Comment,
} from "../types";

// Auth Services
export const signUp = async (
  email: string,
  password: string,
  displayName: string
) => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  // Update profile with display name
  await updateProfile(userCredential.user, {
    displayName,
  });

  // Save user data to Realtime Database
  await set(ref(db, `users/${userCredential.user.uid}`), {
    displayName: displayName,
    email: userCredential.user.email,
  });

  return userCredential.user;
};

export const signIn = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
  return userCredential.user;
};

export const logout = async () => {
  await signOut(auth);
};

export const resetPassword = async (email: string) => {
  await sendPasswordResetEmail(auth, email);
};

// Group Services
export const createGroup = async (
  groupData: Omit<Group, "id" | "adminId" | "members" | "createdAt">
) => {
  const user = auth.currentUser;
  if (!user) throw new Error("No authenticated user");

  const groupRef = push(ref(db, "groups"));
  const groupId = groupRef.key;

  if (!groupId) throw new Error("Failed to generate group ID");

  // Get userName for the creator
  let userName = user.displayName || user.email || user.uid;
  const userProfileRef = ref(db, `users/${user.uid}/profile`);
  const userProfileSnap = await get(userProfileRef);
  if (userProfileSnap.exists() && userProfileSnap.val().displayName) {
    userName = userProfileSnap.val().displayName;
  }

  // Create the group with the current user as admin and member
  const newGroup: Group = {
    ...groupData,
    id: groupId,
    adminId: user.uid,
    adminIds: [user.uid],
    members: {
      [user.uid]: {
        userId: user.uid,
        userName,
        member: "isAdmin",
      },
    },
    createdAt: new Date().toISOString(),
  };

  await set(groupRef, newGroup);

  // Add this group to the user's groups
  const userGroupRef = ref(db, `users/${user.uid}/groups/${groupId}`);
  await set(userGroupRef, true);

  return groupId;
};

export const fetchUserGroups = async () => {
  const user = auth.currentUser;
  if (!user) return [];

  try {
    const userGroupsRef = ref(db, `users/${user.uid}/groups`);
    const snapshot = await get(userGroupsRef);

    if (!snapshot.exists()) return [];

    const groupIds = Object.keys(snapshot.val());
    const groups: Group[] = [];

    for (const groupId of groupIds) {
      const groupRef = ref(db, `groups/${groupId}`);
      const groupSnapshot = await get(groupRef);
      if (groupSnapshot.exists()) {
        groups.push(groupSnapshot.val() as Group);
      }
    }

    return groups;
  } catch (error) {
    console.error("Error fetching user groups:", error);
    return [];
  }
};

export const fetchGroupById = async (groupId: string) => {
  try {
    const groupRef = ref(db, `groups/${groupId}`);
    const snapshot = await get(groupRef);

    if (!snapshot.exists()) {
      throw new Error("Group not found");
    }

    return snapshot.val() as Group;
  } catch (error) {
    console.error("Error fetching group:", error);
    throw error;
  }
};

// Event Services
export const fetchGroupEvents = async (groupId: string) => {
  try {
    // Try ppvs node first
    const eventsRef = ref(db, `groups/${groupId}/ppvs`);
    const snapshot = await get(eventsRef);

    if (snapshot.exists()) {
      const data = snapshot.val();
      if (Array.isArray(data)) {
        // Defensive: filter out nulls (holes in array)
        return data.filter(Boolean) as Event[];
      } else if (typeof data === "object" && data !== null) {
        return Object.values(data) as Event[];
      }
    }

    // Fallback: try events node (legacy or alternate structure)
    const fallbackRef = ref(db, `groups/${groupId}/events`);
    const fallbackSnap = await get(fallbackRef);
    if (fallbackSnap.exists()) {
      const fallbackData = fallbackSnap.val();
      if (Array.isArray(fallbackData)) {
        return fallbackData.filter(Boolean) as Event[];
      } else if (typeof fallbackData === "object" && fallbackData !== null) {
        return Object.values(fallbackData) as Event[];
      }
    }

    // No events found
    console.warn(
      `No events found for group ${groupId} in ppvs or events node.`
    );
    return [];
  } catch (error) {
    console.error("Error fetching group events:", error);
    return [];
  }
};

// Event creation service
export const createEvent = async (
  groupId: string,
  eventData: Omit<Event, "id" | "groupId" | "createdAt">
) => {
  const user = auth.currentUser;
  if (!user) throw new Error("No authenticated user");

  // Generate a new event ref under group/ppvs
  const eventRef = push(ref(db, `groups/${groupId}/ppvs`));
  const eventId = eventRef.key;
  if (!eventId) throw new Error("Failed to generate event ID");

  const newEvent: Event = {
    ...eventData,
    id: eventId,
    groupId,
    createdAt: new Date().toISOString(),
  };

  await set(eventRef, newEvent);
  return newEvent;
};

// Prediction Services
export const savePrediction = async (
  groupId: string,
  eventId: string,
  matchId: string,
  predictedWinnerId: string,
  method: string
) => {
  const user = auth.currentUser;
  if (!user) throw new Error("No authenticated user");

  const prediction: Prediction = {
    id: `${user.uid}_${matchId}`,
    userId: user.uid,
    userName: user.displayName || user.email || user.uid,
    eventId,
    matchId,
    predictedWinnerId,
    method,
    createdAt: new Date().toISOString(),
  };

  const predictionRef = ref(
    db,
    `groups/${groupId}/predictions/${eventId}/${user.uid}/${matchId}`
  );
  await set(predictionRef, prediction);

  return prediction;
};

export const fetchUserPredictions = async (
  groupId: string,
  eventId: string
) => {
  const user = auth.currentUser;
  if (!user) return [];

  try {
    const predictionsRef = ref(
      db,
      `groups/${groupId}/predictions/${eventId}/${user.uid}`
    );
    const snapshot = await get(predictionsRef);

    if (!snapshot.exists()) return [];

    const data = snapshot.val();
    return Object.values(data) as Prediction[];
  } catch (error) {
    console.error("Error fetching user predictions:", error);
    return [];
  }
};

// Post Services
export const createPost = async (groupId: string, content: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error("No authenticated user");

  const postRef = push(ref(db, `groups/${groupId}/posts`));
  const postId = postRef.key;

  if (!postId) throw new Error("Failed to generate post ID");

  const post: Post = {
    id: postId,
    userId: user.uid,
    userName: user.displayName || user.email || user.uid,
    content,
    createdAt: new Date().toISOString(),
  };

  await set(postRef, post);
  return post;
};

export const fetchGroupPosts = async (groupId: string) => {
  try {
    const postsRef = ref(db, `groups/${groupId}/posts`);
    const snapshot = await get(postsRef);

    if (!snapshot.exists()) return [];

    const data = snapshot.val();
    return Object.values(data) as Post[];
  } catch (error) {
    console.error("Error fetching group posts:", error);
    return [];
  }
};

// Leaderboard Services
export const getEventLeaderboard = async (
  groupId: string,
  eventId: string
): Promise<LeaderboardEntry[]> => {
  try {
    const leaderboardRef = ref(db, `groups/${groupId}/leaderboard/${eventId}`);
    const predictionsRef = ref(db, `groups/${groupId}/predictions/${eventId}`);
    const membersRef = ref(db, `groups/${groupId}/members`);

    const [leaderboardSnapshot, predictionsSnapshot, membersSnapshot] =
      await Promise.all([
        get(leaderboardRef),
        get(predictionsRef),
        get(membersRef),
      ]);

    const leaderboard: LeaderboardEntry[] = [];
    const members = membersSnapshot.exists() ? membersSnapshot.val() : {};
    const predictions = predictionsSnapshot.exists()
      ? predictionsSnapshot.val()
      : {};

    if (leaderboardSnapshot.exists()) {
      const leaderboardData = leaderboardSnapshot.val();

      for (const [userId, points] of Object.entries(leaderboardData)) {
        const userPredictions = predictions[userId] || {};
        const correctPredictions = Object.values(userPredictions).filter(
          (pred: any) => pred.isCorrect === true
        ).length;
        const totalPredictions = Object.keys(userPredictions).length;

        const member = members[userId];
        const userName = member ? member.userName : userId;

        leaderboard.push({
          userId,
          userName,
          points: Number(points),
          correctPredictions,
          totalPredictions,
        });
      }
    }

    return leaderboard.sort((a, b) => b.points - a.points);
  } catch (error) {
    console.error("Error fetching event leaderboard:", error);
    return [];
  }
};

// Comment Services
export const createComment = async (
  groupId: string,
  postId: string,
  content: string
) => {
  const user = auth.currentUser;
  if (!user) throw new Error("No authenticated user");

  const commentRef = push(
    ref(db, `groups/${groupId}/posts/${postId}/comments`)
  );
  const commentId = commentRef.key;
  if (!commentId) throw new Error("Failed to generate comment ID");

  const comment: Comment = {
    id: commentId,
    postId,
    userId: user.uid,
    userName: user.displayName || user.email || user.uid,
    content,
    createdAt: new Date().toISOString(),
  };

  await set(commentRef, comment);
  return comment;
};

export const editComment = async (
  groupId: string,
  postId: string,
  commentId: string,
  content: string
) => {
  const user = auth.currentUser;
  if (!user) throw new Error("No authenticated user");
  const commentRef = ref(
    db,
    `groups/${groupId}/posts/${postId}/comments/${commentId}`
  );
  await update(commentRef, {
    content,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteComment = async (
  groupId: string,
  postId: string,
  commentId: string
) => {
  const user = auth.currentUser;
  if (!user) throw new Error("No authenticated user");
  const commentRef = ref(
    db,
    `groups/${groupId}/posts/${postId}/comments/${commentId}`
  );
  await remove(commentRef);
};

export const fetchPostComments = async (groupId: string, postId: string) => {
  try {
    const commentsRef = ref(db, `groups/${groupId}/posts/${postId}/comments`);
    const snapshot = await get(commentsRef);
    if (!snapshot.exists()) return [];
    const data = snapshot.val();
    return Object.values(data) as Comment[];
  } catch (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
};

// Auth state observer
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
import { getFunctions, httpsCallable } from "firebase/functions";

export const inviteUserToGroup = async (
  groupId: string,
  email: string
): Promise<string> => {
  try {
    const functions = getFunctions();
    const inviteUser = httpsCallable(functions, "inviteUserToGroup");
    const result = await inviteUser({ groupId, email });
    const data = result.data as { message: string };
    return data.message;
  } catch (error) {
    console.error("Error inviting user to group:", error);
    throw new Error("Failed to invite user.");
  }
};
