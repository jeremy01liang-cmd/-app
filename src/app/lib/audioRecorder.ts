export type RecordingSession = {
  stop: () => Promise<Blob>;
  cancel: () => Promise<void>;
};

function getRecordingStartError(error: unknown) {
  if (!window.isSecureContext) {
    return new Error("当前预览地址不支持麦克风，请改用本机 localhost 打开，或使用 HTTPS。");
  }

  if (error instanceof DOMException) {
    if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError" || error.name === "SecurityError") {
      return new Error("麦克风权限被拒绝了，请在浏览器地址栏允许麦克风后再试一次。");
    }

    if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
      return new Error("没有检测到可用麦克风，请检查设备后重试。");
    }

    if (error.name === "NotReadableError" || error.name === "TrackStartError") {
      return new Error("麦克风正在被其他应用占用，请关闭占用后重试。");
    }
  }

  return error instanceof Error ? error : new Error("无法启动麦克风，请稍后再试。");
}

function getSupportedRecorderMimeType() {
  if (typeof window === "undefined" || typeof window.MediaRecorder === "undefined") {
    return "";
  }

  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4;codecs=mp4a.40.2",
    "audio/mp4",
    "audio/ogg;codecs=opus",
  ];

  return candidates.find((candidate) => window.MediaRecorder.isTypeSupported?.(candidate)) || "";
}

function mergeBuffers(chunks: Float32Array[]) {
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const merged = new Float32Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }

  return merged;
}

function downsampleBuffer(buffer: Float32Array, inputSampleRate: number, outputSampleRate: number) {
  if (inputSampleRate === outputSampleRate) {
    return buffer;
  }

  const sampleRateRatio = inputSampleRate / outputSampleRate;
  const newLength = Math.round(buffer.length / sampleRateRatio);
  const result = new Float32Array(newLength);
  let offsetResult = 0;
  let offsetBuffer = 0;

  while (offsetResult < result.length) {
    const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
    let accum = 0;
    let count = 0;

    for (let index = offsetBuffer; index < nextOffsetBuffer && index < buffer.length; index += 1) {
      accum += buffer[index];
      count += 1;
    }

    result[offsetResult] = count > 0 ? accum / count : 0;
    offsetResult += 1;
    offsetBuffer = nextOffsetBuffer;
  }

  return result;
}

function floatTo16BitPCM(view: DataView, offset: number, input: Float32Array) {
  let position = offset;
  for (let index = 0; index < input.length; index += 1) {
    const sample = Math.max(-1, Math.min(1, input[index]));
    view.setInt16(position, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
    position += 2;
  }
}

function getAverageLevel(samples: Float32Array) {
  if (!samples.length) {
    return 0;
  }

  let total = 0;
  for (let index = 0; index < samples.length; index += 1) {
    total += Math.abs(samples[index]);
  }

  return total / samples.length;
}

function encodeWav(samples: Float32Array, sampleRate: number) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  const writeString = (offset: number, value: string) => {
    for (let index = 0; index < value.length; index += 1) {
      view.setUint8(offset + index, value.charCodeAt(index));
    }
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, samples.length * 2, true);
  floatTo16BitPCM(view, 44, samples);

  return buffer;
}

async function startMediaRecorderSession(stream: MediaStream): Promise<RecordingSession> {
  const mimeType = getSupportedRecorderMimeType();
  const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
  const chunks: Blob[] = [];

  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      chunks.push(event.data);
    }
  };

  recorder.start();

  const stopTracks = () => {
    stream.getTracks().forEach((track) => track.stop());
  };

  return {
    stop: async () =>
      new Promise<Blob>((resolve, reject) => {
        recorder.onerror = () => {
          stopTracks();
          reject(new Error("录音过程中出错了，请重新试一次。"));
        };

        recorder.onstop = async () => {
          try {
            const blobType = recorder.mimeType || mimeType || chunks[0]?.type || "audio/webm";
            const blob = new Blob(chunks, { type: blobType });
            if (!blob.size) {
              throw new Error("没有采集到有效录音，请重新录制一次。");
            }
            resolve(blob);
          } catch (error) {
            reject(error instanceof Error ? error : new Error("录音处理失败，请重新试一次。"));
          } finally {
            stopTracks();
          }
        };

        recorder.stop();
      }),
    cancel: async () => {
      if (recorder.state !== "inactive") {
        recorder.onstop = () => {
          stopTracks();
        };
        recorder.stop();
        return;
      }

      stopTracks();
    },
  };
}

async function startPcmFallbackSession(stream: MediaStream): Promise<RecordingSession> {
  const audioContext = new AudioContext();
  const input = audioContext.createMediaStreamSource(stream);
  const processor = audioContext.createScriptProcessor(4096, 1, 1);
  const silentGain = audioContext.createGain();
  silentGain.gain.value = 0;

  const chunks: Float32Array[] = [];

  processor.onaudioprocess = (event) => {
    const channelData = event.inputBuffer.getChannelData(0);
    chunks.push(new Float32Array(channelData));
  };

  input.connect(processor);
  processor.connect(silentGain);
  silentGain.connect(audioContext.destination);

  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }

  const cleanup = async () => {
    processor.disconnect();
    input.disconnect();
    silentGain.disconnect();
    stream.getTracks().forEach((track) => track.stop());
    await audioContext.close();
  };

  return {
    stop: async () => {
      try {
        const merged = mergeBuffers(chunks);
        if (!merged.length) {
          throw new Error("没有采集到麦克风声音，请重新授权麦克风后再试一次。");
        }

        const downsampled = downsampleBuffer(merged, audioContext.sampleRate, 16000);
        if (getAverageLevel(downsampled) < 0.003) {
          throw new Error("录到的声音太小或是静音，请靠近麦克风再试一次。");
        }

        const wavBuffer = encodeWav(downsampled, 16000);
        return new Blob([wavBuffer], { type: "audio/wav" });
      } finally {
        await cleanup();
      }
    },
    cancel: cleanup,
  };
}

export async function startWavRecording(): Promise<RecordingSession> {
  if (!window.isSecureContext) {
    throw new Error("当前预览地址不支持麦克风，请改用本机 localhost 打开，或使用 HTTPS。");
  }

  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error("当前浏览器不支持录音，请换一个较新的浏览器再试。");
  }

  let stream: MediaStream;

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
      },
    });
  } catch (error) {
    throw getRecordingStartError(error);
  }

  if (typeof window.MediaRecorder !== "undefined") {
    try {
      return await startMediaRecorderSession(stream);
    } catch (error) {
      stream.getTracks().forEach((track) => track.stop());
      throw error instanceof Error ? error : new Error("无法启动录音，请稍后再试。");
    }
  }

  return startPcmFallbackSession(stream);
}
