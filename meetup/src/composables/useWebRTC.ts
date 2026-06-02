import { ref, shallowRef, type Ref } from 'vue';
import { getSignalingSocket, disconnectSignaling } from '../api/signaling';
import type { Participant } from '../types';

const SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export interface UserInfo {
  displayName: string;
  initials: string;
  avatar: string | null;
}

export function useWebRTC(roomSlug: string, userInfo?: UserInfo) {
  const localStream: Ref<MediaStream | null> = shallowRef(null);
  const screenStream: Ref<MediaStream | null> = shallowRef(null);
  const participants = ref<Participant[]>([]);
  const isMuted = ref(false);
  const isVideoOff = ref(false);
  const isScreenSharing = ref(false);
  const isConnecting = ref(true);
  const mediaDenied = ref(false);
  const error = ref<string | null>(null);

  const peerConnections = new Map<string, RTCPeerConnection>();
  const socket = getSignalingSocket();

  function createPeerConnection(remoteId: string): RTCPeerConnection {
    const pc = new RTCPeerConnection(SERVERS);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', { target: remoteId, candidate: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      const stream = event.streams[0];
      if (stream) {
        updateParticipantStream(remoteId, stream);
      }
    };

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') {
        removeParticipant(remoteId);
      }
    };

    // Add local tracks if already available
    if (localStream.value) {
      addLocalTracksToPeer(pc);
    }

    peerConnections.set(remoteId, pc);
    return pc;
  }

  function addLocalTracksToPeer(pc: RTCPeerConnection) {
    if (!localStream.value) return;
    localStream.value.getTracks().forEach((track) => {
      pc.addTrack(track, localStream.value!);
    });
  }

  function addLocalTracksToAllPeers() {
    if (!localStream.value) return;
    peerConnections.forEach((pc) => {
      localStream.value!.getTracks().forEach((track) => {
        // Avoid adding duplicate senders
        const already = pc.getSenders().some((s) => s.track?.kind === track.kind);
        if (!already) {
          pc.addTrack(track, localStream.value!);
        }
      });
    });
  }

  function updateParticipantStream(socketId: string, stream: MediaStream, info?: { displayName: string; initials: string; avatar: string | null } | null) {
    const existing = participants.value.find((p) => p.socketId === socketId);
    if (existing) {
      existing.stream = stream;
    } else {
      participants.value = [
        ...participants.value,
        {
          socketId,
          userName: info?.displayName ?? `Участник`,
          displayName: info?.displayName ?? '',
          initials: info?.initials ?? '?',
          avatar: info?.avatar ?? null,
          stream,
          isMuted: false,
          isVideoOff: false,
          isScreenSharing: false,
        },
      ];
    }
  }

  function removeParticipant(socketId: string) {
    const pc = peerConnections.get(socketId);
    if (pc) {
      pc.close();
      peerConnections.delete(socketId);
    }
    participants.value = participants.value.filter((p) => p.socketId !== socketId);
  }

  async function enableMedia(kinds?: { video?: boolean; audio?: boolean }) {
    const constraints = {
      video: kinds?.video ?? true,
      audio: kinds?.audio ?? true,
    };
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStream.value = stream;
      mediaDenied.value = false;
      isMuted.value = false;
      isVideoOff.value = false;

      // Add tracks to all existing peer connections and renegotiate
      addLocalTracksToAllPeers();
      await renegotiateAllPeers();
    } catch (e) {
      mediaDenied.value = true;
      console.error('Failed to get media:', e);
    }
  }

  async function renegotiateAllPeers() {
    for (const [remoteId, pc] of peerConnections.entries()) {
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('offer', { target: remoteId, offer });
      } catch (e) {
        console.error('Renegotiation error:', e);
      }
    }
  }

  async function joinRoom() {
    socket.emit('join-room', roomSlug, userInfo);

    socket.on('user-connected', async (remoteSocketId: string, remoteInfo?: { displayName: string; initials: string; avatar: string | null }) => {
      // Store/update participant info
      const existing = participants.value.find((p) => p.socketId === remoteSocketId);
      if (existing && remoteInfo) {
        existing.userName = remoteInfo.displayName;
        existing.displayName = remoteInfo.displayName;
        existing.initials = remoteInfo.initials;
        existing.avatar = remoteInfo.avatar;
      } else if (!existing && remoteInfo) {
        participants.value = [
          ...participants.value,
          {
            socketId: remoteSocketId,
            userName: remoteInfo.displayName,
            displayName: remoteInfo.displayName,
            initials: remoteInfo.initials,
            avatar: remoteInfo.avatar,
            stream: undefined,
            isMuted: false,
            isVideoOff: false,
            isScreenSharing: false,
          },
        ];
      }

      const pc = createPeerConnection(remoteSocketId);
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('offer', { target: remoteSocketId, offer });
      } catch (e) {
        console.error('Error creating offer:', e);
      }
    });

    socket.on('offer', async (payload: { from: string; offer: RTCSessionDescriptionInit }) => {
      let pc = peerConnections.get(payload.from);
      if (!pc) pc = createPeerConnection(payload.from);
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(payload.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('answer', { target: payload.from, answer });
      } catch (e) {
        console.error('Error handling offer:', e);
      }
    });

    socket.on('answer', async (payload: { from: string; answer: RTCSessionDescriptionInit }) => {
      const pc = peerConnections.get(payload.from);
      if (pc) {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(payload.answer));
        } catch (e) {
          console.error('Error handling answer:', e);
        }
      }
    });

    socket.on('ice-candidate', async (payload: { from: string; candidate: RTCIceCandidateInit }) => {
      const pc = peerConnections.get(payload.from);
      if (pc) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
        } catch (e) {
          console.error('Error adding ICE candidate:', e);
        }
      }
    });

    socket.on('user-disconnected', (remoteSocketId: string) => {
      removeParticipant(remoteSocketId);
    });

    isConnecting.value = false;
  }

  function toggleMute() {
    if (localStream.value) {
      const audioTrack = localStream.value.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        isMuted.value = !audioTrack.enabled;
      }
    }
  }

  function toggleVideo() {
    if (localStream.value) {
      const videoTrack = localStream.value.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        isVideoOff.value = !videoTrack.enabled;
      }
    }
  }

  async function toggleScreenShare() {
    if (isScreenSharing.value) {
      stopScreenShare();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      screenStream.value = stream;
      isScreenSharing.value = true;

      const screenTrack = stream.getVideoTracks()[0];
      if (screenTrack) {
        peerConnections.forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
          if (sender) sender.replaceTrack(screenTrack);
        });
        screenTrack.onended = () => stopScreenShare();
      }
    } catch (e) {
      console.error('Screen share error:', e);
    }
  }

  function stopScreenShare() {
    if (screenStream.value) {
      screenStream.value.getTracks().forEach((t) => t.stop());
      screenStream.value = null;
    }
    isScreenSharing.value = false;

    const cameraTrack = localStream.value?.getVideoTracks()[0];
    if (cameraTrack) {
      peerConnections.forEach((pc) => {
        const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
        if (sender) sender.replaceTrack(cameraTrack);
      });
    }
  }

  async function leaveRoom() {
    peerConnections.forEach((pc) => pc.close());
    peerConnections.clear();
    if (localStream.value) {
      localStream.value.getTracks().forEach((t) => t.stop());
      localStream.value = null;
    }
    if (screenStream.value) {
      screenStream.value.getTracks().forEach((t) => t.stop());
      screenStream.value = null;
    }
    socket.removeAllListeners();
    disconnectSignaling();
    participants.value = [];
    isConnecting.value = true;
    mediaDenied.value = false;
  }

  return {
    localStream,
    screenStream,
    participants,
    isMuted,
    isVideoOff,
    isScreenSharing,
    isConnecting,
    mediaDenied,
    error,
    joinRoom,
    enableMedia,
    leaveRoom,
    toggleMute,
    toggleVideo,
    toggleScreenShare,
  };
}
