import { ref } from 'vue'

// Список доступных микрофонов
export const audioInputs = ref<MediaDeviceInfo[]>([])

// Текущий выбранный микрофон
export const selectedAudioInputId = ref<string>('')

// Загружаем список микрофонов браузера
export async function loadAudioDevices() {
  const devices = await navigator.mediaDevices.enumerateDevices()
  audioInputs.value = devices.filter((d) => d.kind === 'audioinput')
}

// Сменить микрофон посреди звонка.
// currentStream — текущий localStream из useWebRTC
// replaceAudioInPeers — колбэк, который сделает replaceTrack во всех peer
export async function changeAudioInput(
  currentStream: MediaStream,
  replaceAudioInPeers: (newTrack: MediaStreamTrack) => Promise<void>,
) {
  if (!selectedAudioInputId.value) return

  let newStream: MediaStream
  try {
    newStream = await navigator.mediaDevices.getUserMedia({
      audio: { deviceId: { exact: selectedAudioInputId.value } },
    })
  } catch (e) {
    console.error('Failed to access new microphone:', e)
    return
  }

  const newTrack = newStream.getAudioTracks()[0]
  if (!newTrack) {
    console.error('New microphone returned no audio track')
    return
  }

  const oldTrack = currentStream.getAudioTracks()[0]

  try {
    await replaceAudioInPeers(newTrack)
  } catch (e) {
    console.error('Failed to switch microphone in peer connections:', e)
    newTrack.stop()
    return
  }

  if (oldTrack) {
    currentStream.removeTrack(oldTrack)
    oldTrack.stop()
  }
  currentStream.addTrack(newTrack)
}
