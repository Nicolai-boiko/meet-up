import { ref } from 'vue'
import type { DenoiseHandle } from 'denoise-voice-clarity'

// Список доступных микрофонов
export const audioInputs = ref<MediaDeviceInfo[]>([])

// Текущий выбранный микрофон
export const selectedAudioInputId = ref<string>('')

// Включено ли шумоподавление
export const noiseSuppressionEnabled = ref(false)

// Активный денойзер DeepFilterNet (null = выключен)
let denoiser: DenoiseHandle | null = null

// Загружаем список микрофонов браузера
export async function loadAudioDevices() {
  const devices = await navigator.mediaDevices.enumerateDevices()
  audioInputs.value = devices.filter((d) => d.kind === 'audioinput')
}

async function destroyDenoiser() {
  if (!denoiser) return
  const d = denoiser
  denoiser = null
  await d.destroy()
}

// Сменить микрофон: подменяем только «сырой» трек в localStream.
// Подмену трека в peer-соединениях делает syncPeerAudioTrack (чтобы учесть шумоподавление).
export async function changeAudioInput(currentStream: MediaStream) {
  if (!selectedAudioInputId.value) return

  let newStream: MediaStream
  try {
    newStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        deviceId: { exact: selectedAudioInputId.value },
        // Нативная обработка отключена — шумодавит DeepFilterNet, двойная обработка ухудшает звук
        noiseSuppression: false,
        autoGainControl: false,
        echoCancellation: true,
      },
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
  if (oldTrack) {
    currentStream.removeTrack(oldTrack)
    oldTrack.stop()
  }
  currentStream.addTrack(newTrack)
}

// Единая точка: решаем, какой трек отдать в peer-соединения.
// Шумоподавление вкл -> обработанный трек, выкл -> сырой трек микрофона.
export async function syncPeerAudioTrack(
  rawStream: MediaStream,
  replaceAudioInPeers: (newTrack: MediaStreamTrack) => Promise<void>,
) {
  const rawTrack = rawStream.getAudioTracks()[0]
  if (!rawTrack) return

  await destroyDenoiser()

  if (!noiseSuppressionEnabled.value) {
    await replaceAudioInPeers(rawTrack)
    return
  }

  try {
    // Динамический импорт — много-мегабайтный WASM не попадает в основной бандл
    const { createDenoisedStream, isVoiceClaritySupported } = await import('denoise-voice-clarity')

    if (!isVoiceClaritySupported()) {
      console.warn('[noise-suppression] DeepFilterNet is not supported in this browser')
      await replaceAudioInPeers(rawTrack)
      return
    }

    denoiser = await createDenoisedStream(rawStream, {
      enabled: true,
      attenuationLimitDb: 30,
      presenceGainDb: 4,
    })
    await replaceAudioInPeers(denoiser.track)
  } catch (e) {
    console.error('[noise-suppression] failed to enable:', e)
    // Откатываемся на сырой трек, чтобы звук не пропал совсем
    await replaceAudioInPeers(rawTrack)
  }
}

// Полная очистка при выходе из комнаты
export function disposeAudioProcessor() {
  void destroyDenoiser()
}
