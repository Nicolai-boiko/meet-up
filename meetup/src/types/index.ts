export interface UserSummary {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
  firstName: string | null;
  lastName: string | null;
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

export interface ContentItem {
  id: number;
  title: string;
  type: string;
  body: string | null;
  mediaUrl: string | null;
  authorId: number;
  createdAt: string;
  author?: { id: number; name: string; avatar: string | null };
}

export interface SignalingPayload {
  target: string;
  offer?: RTCSessionDescriptionInit;
  answer?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
}
