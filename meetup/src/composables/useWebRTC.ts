import { ref, shallowRef, type Ref } from 'vue';
import { getSignalingSocket, disconnectSignaling } from '../api/signaling';
import type { Participant } from '../types';

const SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export function useWebRTC(roomSlug: string, myName = '', myInit = '?') {
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
        const already = pc.getSenders().some((s) => s.track?.kind === track.kind);
        if (!already) pc.addTrack(track, localStream.value!);
      });
    });
  }

  function updateParticipantStream(socketId: string, stream: MediaStream) {
    const existing = participants.value.find((p) => p.socketId === socketId);
    if (existing) {
      existing.stream = stream;
    } else {
      participants.value = [
        ...participants.value,
        { socketId, userName: `Участник`, displayName: '', initials: '?', avatar: null, stream, isMuted: false, isVideoOff: false, isScreenSharing: false },
      ];
    }
  }

  function removeParticipant(socketId: string) {
    const pc = peerConnections.get(socketId);
    if (pc) { pc.close(); peerConnections.delete(socketId); }
    participants.value = participants.value.filter((p) => p.socketId !== socketId);
  }

  function broadcastUserInfo(remoteId: string) {
    if (myName) {
      socket.emit('user-info', { to: remoteId, name: myName, init: myInit });
    }
  }

  function broadcastMediaState() {
    peerConnections.forEach((_, remoteId) => {
      socket.emit('media-state', { to: remoteId, muted: isMuted.value, videoOff: isVideoOff.value });
    });
  }

  async function enableMedia(kinds?: { video?: boolean; audio?: boolean }) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: kinds?.video ?? true,
        audio: kinds?.audio ?? true,
      });
      localStream.value = stream;
      mediaDenied.value = false;
      isMuted.value = false;
      isVideoOff.value = false;
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
      } catch (e) { console.error('Renegotiation error:', e); }
    }
  }

  async function joinRoom() {
    socket.emit('join-room', roomSlug);

    socket.on('user-connected', async (remoteSocketId: string) => {
      if (!participants.value.find((p) => p.socketId === remoteSocketId)) {
        participants.value = [
          ...participants.value,
          { socketId: remoteSocketId, userName: `Участник`, displayName: '', initials: '?', avatar: null, stream: undefined, isMuted: false, isVideoOff: false, isScreenSharing: false },
        ];
      }
      const pc = createPeerConnection(remoteSocketId);
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('offer', { target: remoteSocketId, offer });
        broadcastUserInfo(remoteSocketId);
      } catch (e) { console.error('Error creating offer:', e); }
    });

    socket.on('offer', async (payload: { from: string; offer: RTCSessionDescriptionInit }) => {
      let pc = peerConnections.get(payload.from);
      if (!pc) pc = createPeerConnection(payload.from);
      if (!participants.value.find((p) => p.socketId === payload.from)) {
        participants.value = [
          ...participants.value,
          { socketId: payload.from, userName: `Участник`, displayName: '', initials: '?', avatar: null, stream: undefined, isMuted: false, isVideoOff: false, isScreenSharing: false },
        ];
      }
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(payload.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('answer', { target: payload.from, answer });
        broadcastUserInfo(payload.from);
      } catch (e) { console.error('Error handling offer:', e); }
    });

    socket.on('answer', async (payload: { from: string; answer: RTCSessionDescriptionInit }) => {
      const pc = peerConnections.get(payload.from);
      if (pc) {
        try { await pc.setRemoteDescription(new RTCSessionDescription(payload.answer)); }
        catch (e) { console.error('Error handling answer:', e); }
      }
    });

    socket.on('ice-candidate', async (payload: { from: string; candidate: RTCIceCandidateInit }) => {
      const pc = peerConnections.get(payload.from);
      if (pc) {
        try { await pc.addIceCandidate(new RTCIceCandidate(payload.candidate)); }
        catch (e) { console.error('Error adding ICE candidate:', e); }
      }
    });

    socket.on('user-info', (data: { id: string; name: string; init: string }) => {
      const p = participants.value.find((p) => p.socketId === data.id);
      if (p) {
        p.displayName = data.name;
        p.userName = data.name;
        p.initials = data.init;
      }
    });

    socket.on('media-state', (data: { id: string; muted: boolean; videoOff: boolean }) => {
      const p = participants.value.find((p) => p.socketId === data.id);
      if (p) { p.isMuted = data.muted; p.isVideoOff = data.videoOff; }
    });

    socket.on('user-disconnected', (remoteSocketId: string) => {
      removeParticipant(remoteSocketId);
    });

    isConnecting.value = false;
  }

  function toggleMute() {
    if (localStream.value) {
      const t = localStream.value.getAudioTracks()[0];
      if (t) { t.enabled = !t.enabled; isMuted.value = !t.enabled; broadcastMediaState(); }
    }
  }

  function toggleVideo() {
    if (localStream.value) {
      const t = localStream.value.getVideoTracks()[0];
      if (t) { t.enabled = !t.enabled; isVideoOff.value = !t.enabled; broadcastMediaState(); }
    }
  }

  async function toggleScreenShare() {
    if (isScreenSharing.value) { stopScreenShare(); return; }
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      screenStream.value = stream;
      isScreenSharing.value = true;
      const screenTrack = stream.getVideoTracks()[0];
      if (screenTrack) {
        peerConnections.forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
          if (sender) sender.replaceTrack(screenTrack);
          else { pc.addTrack(screenTrack, stream); renegotiateSinglePeer(pc); }
        });
        screenTrack.onended = () => stopScreenShare();
      }
    } catch (e) { console.error('Screen share error:', e); }
  }

  function stopScreenShare() {
    if (screenStream.value) { screenStream.value.getTracks().forEach((t) => t.stop()); screenStream.value = null; }
    isScreenSharing.value = false;
    const cameraTrack = localStream.value?.getVideoTracks()[0];
    if (cameraTrack) {
      peerConnections.forEach((pc) => {
        const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
        if (sender) sender.replaceTrack(cameraTrack);
        else { pc.addTrack(cameraTrack, localStream.value!); renegotiateSinglePeer(pc); }
      });
    } else {
      peerConnections.forEach((pc) => {
        const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
        if (sender) pc.removeTrack(sender);
      });
    }
  }

  async function renegotiateSinglePeer(pc: RTCPeerConnection) {
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      for (const [remoteId, existingPc] of peerConnections.entries()) {
        if (existingPc === pc) { socket.emit('offer', { target: remoteId, offer }); break; }
      }
    } catch (e) { console.error('Renegotiation error:', e); }
  }

  async function leaveRoom() {
    peerConnections.forEach((pc) => pc.close());
    peerConnections.clear();
    if (localStream.value) { localStream.value.getTracks().forEach((t) => t.stop()); localStream.value = null; }
    if (screenStream.value) { screenStream.value.getTracks().forEach((t) => t.stop()); screenStream.value = null; }
    socket.removeAllListeners();
    disconnectSignaling();
    participants.value = [];
    isConnecting.value = true;
    mediaDenied.value = false;
  }

  return {
    localStream, screenStream, participants, isMuted, isVideoOff, isScreenSharing,
    isConnecting, mediaDenied, error, joinRoom, enableMedia, leaveRoom,
    toggleMute, toggleVideo, toggleScreenShare,
  };
}
