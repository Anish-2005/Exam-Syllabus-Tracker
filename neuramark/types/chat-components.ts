import { ChatRoom, Message, PendingRequest, RoomMember } from '../types';

export interface ChatComponentProps {
  isDark: boolean;
  textColor: string;
  secondaryText: string;
  borderColor: string;
  hoverBg: string;
  inputBg?: string;
  cardBg: string;
}

export interface NavigationBarProps extends ChatComponentProps {
  toggleTheme: () => void;
  isSuperAdmin: boolean;
  currentRoom: ChatRoom | null;
  pendingRequests: PendingRequest[];
  canManageRequests: boolean;
  showRoomList: boolean;
  setShowRoomList: (show: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  setShowPendingRequestsModal: (show: boolean) => void;
  setShowMembersModal: (show: boolean) => void;
}

export interface SidebarProps extends ChatComponentProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  user: any; // TODO: Use proper User type
  logout: () => Promise<void>;
  setShowJoinRoomModal: (show: boolean) => void;
  setShowCreateRoomModal: (show: boolean) => void;
  currentRoom: ChatRoom | null;
  pendingRequests: PendingRequest[];
  setShowPendingRequestsModal: (show: boolean) => void;
  setShowMembersModal: (show: boolean) => void;
  canManageRequests: boolean;
  currentRoomMembers: RoomMember[];
}

export interface RoomListProps extends ChatComponentProps {
  filteredRooms: ChatRoom[];
  currentRoom: ChatRoom | null;
  setCurrentRoom: (room: ChatRoom | null) => void;
  setShowRoomList: (show: boolean) => void;
  setShowCreateRoomModal: (show: boolean) => void;
  setShowJoinRoomModal: (show: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  showRoomList: boolean;
}

export interface MobileRoomListProps extends ChatComponentProps {
  filteredRooms: ChatRoom[];
  currentRoom: ChatRoom | null;
  setCurrentRoom: (room: ChatRoom | null) => void;
  setShowRoomList: (show: boolean) => void;
  setShowCreateRoomModal: (show: boolean) => void;
  setShowJoinRoomModal: (show: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  showRoomList: boolean;
}

export interface ChatAreaProps extends ChatComponentProps {
  currentRoom: ChatRoom | null;
  messages: Message[];
  loading: boolean;
  newMessage: string;
  setNewMessage: (message: string) => void;
  handleSendMessage: (e: React.FormEvent) => Promise<void>;
  user: any; // TODO: Use proper User type
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  formatTime: (timestamp: any) => string;
  getRoleBadge: (role: string) => JSX.Element | null;
  getUserRole: () => string;
  canManageRequests: boolean;
  pendingRequests: PendingRequest[];
  setShowPendingRequestsModal: (show: boolean) => void;
  setShowMembersModal: (show: boolean) => void;
  setShowRoomSettings: (show: boolean) => void;
  setShowCreateRoomModal: (show: boolean) => void;
  setShowRoomList: (show: boolean) => void;
  copiedCode: boolean;
  copyRoomCode: (code: string) => Promise<void>;
  showRoomList: boolean;
}

export interface CreateRoomModalProps extends ChatComponentProps {
  showCreateRoomModal: boolean;
  setShowCreateRoomModal: (show: boolean) => void;
  newRoomName: string;
  setNewRoomName: (name: string) => void;
  newRoomType: string;
  setNewRoomType: (type: string) => void;
  createNewRoom: () => Promise<void>;
}

export interface JoinRoomModalProps extends ChatComponentProps {
  showJoinRoomModal: boolean;
  setShowJoinRoomModal: (show: boolean) => void;
  joinRoomCode: string;
  setJoinRoomCode: (code: string) => void;
  joinRoomByCode: () => Promise<void>;
}

export interface MembersModalProps extends ChatComponentProps {
  showMembersModal: boolean;
  setShowMembersModal: (show: boolean) => void;
  currentRoomMembers: RoomMember[];
  currentRoom: ChatRoom | null;
  user: any; // TODO: Use proper User type
  canManageMembers: boolean;
  canManageRoles: boolean;
  makeUserModerator: (userId: string) => Promise<void>;
  removeUserModerator: (userId: string) => Promise<void>;
  removeUserFromRoom: (userId: string) => Promise<void>;
}

export interface PendingRequestsModalProps extends ChatComponentProps {
  showPendingRequestsModal: boolean;
  setShowPendingRequestsModal: (show: boolean) => void;
  pendingRequests: PendingRequest[];
  handleJoinRequest: (requestId: string, action: string) => Promise<void>;
}

export interface RoomSettingsModalProps extends ChatComponentProps {
  showRoomSettings: boolean;
  setShowRoomSettings: (show: boolean) => void;
  currentRoom: ChatRoom | null;
  currentRoomMembers: RoomMember[];
  user: any; // TODO: Use proper User type
  isSuperAdmin: boolean;
  newAdminId: string;
  setNewAdminId: (id: string) => void;
  canManageRoles: boolean;
  transferAdmin: () => Promise<void>;
  deleteRoom: (roomId: string) => Promise<void>;
  leaveRoom: (roomId: string) => Promise<void>;
}