function getSpeechApiBaseUrl() {
  const configuredOrigin = import.meta.env.VITE_SPEECH_API_ORIGIN?.trim().replace(/\/$/, "");
  if (configuredOrigin) {
    return configuredOrigin;
  }

  return "";
}

function getSpeechApiUrl(path: string) {
  return `${getSpeechApiBaseUrl()}${path}`;
}

export async function synthesizeWordAudio(text: string) {
  const response = await fetch(getSpeechApiUrl("/api/aliyun-speech/tts"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.message || "语音合成失败");
  }

  return response.blob();
}

export async function recognizeWordAudio(audioBlob: Blob) {
  const response = await fetch(getSpeechApiUrl("/api/aliyun-speech/asr"), {
    method: "POST",
    headers: {
      "Content-Type": "application/octet-stream",
    },
    body: audioBlob,
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.ok) {
    throw new Error(payload?.message || "语音识别失败");
  }

  return payload as {
    ok: true;
    transcript: string;
    raw: unknown;
  };
}
