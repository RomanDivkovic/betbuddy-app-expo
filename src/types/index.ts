// User model
export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
}

// Group
export interface GroupMember {
  userId: string;
  userName: string;
  member: "isAdmin" | "member"; // Use existing member field structure
}

export interface Group {
  id: string;
  name: string;
  description: string;
  adminIds: string[]; // Changed from single adminId to array of adminIds
  adminId?: string; // Keep for backward compatibility
  members: {
    [userId: string]: GroupMember;
  };
  createdAt: string;
  posts?: Record<string, Post>;
  series?: Record<string, Series>;
  bettingEnabled?: boolean;
  events?: Record<string, Event>;
}

// Post model inside group
export interface Post {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  likes?: string[];
  dislikes?: string[];
  edited?: boolean;
}

// Comment model for posts
export interface Comment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

// Invitation to group
export interface Invitation {
  id: string;
  groupId: string;
  groupName?: string;
  userEmail: string;
  status: "pending" | "accepted" | "declined";
  createdAt: string;
}

// Fighter inside match
export interface Fighter {
  id: string;
  name: string;
  record: string;
  country: string;
  logo?: string; // Fighter image URL (optional)
}

// A single match inside an event
export interface Match {
  id: string;
  eventId: string;
  fighter1: Fighter;
  fighter2: Fighter;
  status: "upcoming" | "live" | "completed";
  order: number;
  winnerId?: string;
  result?: {
    winner: "fighter1" | "fighter2";
    method: string;
  };
  type?: string; // Added to support 'Main event', 'Co-main', etc.
}

// Main event model used across app
export interface Event {
  id: string;
  title: string;
  date: string;
  place?: string;
  location?: string;
  groupId: string;
  matches: Match[];
  status: "upcoming" | "live" | "completed";
  imageUrl?: string;
  createdAt: string;
  isPartOfSeries?: boolean;
  seriesId?: string;
  externalId?: string;
  apiSlug?: string;
}

// User prediction for a match
export interface Prediction {
  id: string;
  userId: string;
  userName: string;
  eventId: string;
  matchId: string;
  predictedWinnerId: string;
  method: string; // Added method property
  createdAt: string;
  updatedAt?: string;
  isCorrect?: boolean;
  isCorrectMethod?: boolean; // Added to track if method prediction was correct
  pointsEarned?: number;
}

// Event series model
export interface Series {
  id: string;
  name: string;
  description?: string;
  groupId: string;
  events: string[];
  startDate: string;
  endDate: string;
  status: "upcoming" | "active" | "completed";
  createdAt: string;
}

// Leaderboard result per user
export interface LeaderboardEntry {
  userId: string;
  userName: string;
  points: number;
  correctPredictions: number;
  totalPredictions: number;
}

// Email result type
export interface EmailResult {
  success: boolean;
  message: string;
}

// For messaging system
export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  content: string;
  createdAt: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: string[];
  participantNames?: Record<string, string>;
  lastMessageAt: string;
  lastMessageContent: string;
  unreadCount: number | Record<string, number>;
}

// Bet system
export interface Bet {
  id: string;
  groupId: string;
  title: string;
  description?: string;
  creatorId: string;
  creatorName: string;
  eventId?: string;
  matchId?: string;
  options: BetOption[];
  status: "open" | "closed" | "settled";
  createdAt: string;
  closesAt: string;
  settledAt?: string;
}

export interface BetOption {
  id: string;
  text: string;
  userBets: UserBet[];
}

export interface UserBet {
  userId: string;
  userName: string;
  amount: number;
  createdAt: string;
}

// Navigation types for React Navigation
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  GroupDetails: { groupId: string };
  EventDetails: { eventId: string; groupId: string };
  Profile: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Groups: undefined;
  Events: undefined;
  Profile: undefined;
};
