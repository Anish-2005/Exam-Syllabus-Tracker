export interface ChatRoom {
  id: string;
  name: string;
  description?: string;
  members: string[];
  admin: string;
  moderators?: string[];
  createdAt: Date;
  updatedAt: Date;
  isPrivate: boolean;
  isGlobal?: boolean;
  type?: 'public' | 'private' | 'global';
  code?: string;
}

export interface Message {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file';
  fileUrl?: string;
  displayName?: string;
  photoURL?: string;
  userId?: string;
  isAdmin?: boolean;
  isModerator?: boolean;
  text?: string; // For backward compatibility
}

export interface PendingRequest {
  id: string;
  userDetails: {
    name: string;
    email: string;
    photoURL?: string;
  };
  roomId: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: Date;
  handledBy?: string;
  handledAt?: Date;
}

export interface RoomMember {
  id: string;
  displayName: string;
  email: string;
  photoURL?: string;
  role: 'admin' | 'moderator' | 'member';
  joinedAt: Date;
  isOnline: boolean;
  lastSeen?: Date;
}

export interface ChatState {
  rooms: ChatRoom[];
  currentRoom: ChatRoom | null;
  messages: Message[];
  loading: boolean;
  currentRoomMembers: RoomMember[];
  pendingRequests: PendingRequest[];
  allUsers: any[]; // TODO: Define proper user type
}