export interface UserSummary {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
  firstName: string | null;
  lastName: string | null;
  role?: string;
}

export interface ParticipantInfo extends UserSummary {
  status: MeetingParticipantStatus;
  meetingParticipantId: number;
}

export type MeetingParticipantStatus = 'INVITED' | 'ACCEPTED' | 'DECLINED';

export interface RoomSummary {
  id: number;
  title: string;
  slug: string;
  isActive: boolean;
  isPrivate?: boolean;
}

export interface Meetup {
  id: number;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string;
  createdAt: string;
  hostId: number;
  roomId: number | null;
  host?: UserSummary;
  participants?: ParticipantInfo[];
  room?: RoomSummary | null;
}

export interface UserCredentials {
  name?: string;
  email: string;
  password: string;
}

export interface UserProfile {
  id: number;
  email: string;
  name: string;
  role: string;
  firstName: string | null;
  lastName: string | null;
  birthDate: string | null;
  avatar: string | null;
  createdAt: string;
}

export interface ProfileUpdatePayload {
  firstName?: string | null;
  lastName?: string | null;
  birthDate?: string | null;
  avatar?: string | null;
}

export interface PasswordChangePayload {
  currentPassword: string;
  newPassword: string;
}

export interface Room {
  id: number;
  title: string;
  slug: string;
  isActive: boolean;
  isPrivate?: boolean;
  hostId: number;
  createdAt: string;
  host?: { id: number; name: string; email: string };
}

export interface Participant {
  socketId: string;
  userId?: string;
  userName: string;
  displayName: string;
  initials: string;
  avatar: string | null;
  stream?: MediaStream;
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
}

export interface Tag {
  id: number;
  name: string;
}

export interface ContentFile {
  id: number;
  contentId: number;
  fileName: string;
  filePath: string;
  fileSize: number | null;
  createdAt: string;
}

export interface ContentItem {
  id: number;
  title: string;
  type: string;
  body: string | null;
  mediaUrl: string | null;
  fileName: string | null;
  authorId: number;
  createdAt: string;
  author?: { id: number; name: string; avatar: string | null };
  tags?: Tag[];
  files?: ContentFile[];
  isFavorited?: boolean;
}

export interface AdminStats {
  totals: {
    users: number;
    content: number;
    meetings: number;
    files: number;
    totalStorage: number;
  };
  usersByDay: { date: string; count: number }[];
  contentByType: { type: string; count: number }[];
  topAuthors: { id: number; name: string; avatar: string | null; count: number }[];
  contentByTag: { tagId: number; tagName: string; count: number }[];
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SignalingPayload {
  target: string;
  offer?: RTCSessionDescriptionInit;
  answer?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
}
