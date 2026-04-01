import crypto from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
import { URL } from "node:url";
import type { Plugin } from "vite";

type SpeechEnv = {
  accessKeyId?: string;
  accessKeySecret?: string;
  appKey?: string;
  token?: string;
  region: string;
  voice: string;
};

type TokenCache = {
  token?: string;
  expireAt?: number;
};

const tokenCache: TokenCache = {};

function percentEncode(value: string) {
  return encodeURIComponent(value)
    .replace(/\+/g, "%20")
    .replace(/\*/g, "%2A")
    .replace(/%7E/g, "~");
}

function readSpeechEnv(): SpeechEnv {
  return {
    accessKeyId: process.env.ALIYUN_AK_ID,
    accessKeySecret: process.env.ALIYUN_AK_SECRET,
    appKey: process.env.ALIYUN_NLS_APP_KEY,
    token: process.env.ALIYUN_NLS_TOKEN,
    region: process.env.ALIYUN_NLS_REGION || "cn-shanghai",
    voice: process.env.ALIYUN_NLS_VOICE || "xiaoyun",
  };
}

function createTokenRequestUrl(env: SpeechEnv) {
  if (!env.accessKeyId || !env.accessKeySecret) {
    throw new Error("缺少阿里云 AccessKey 配置");
  }

  const params = new Map<string, string>([
    ["AccessKeyId", env.accessKeyId],
    ["Action", "CreateToken"],
    ["Format", "JSON"],
    ["RegionId", env.region],
    ["SignatureMethod", "HMAC-SHA1"],
    ["SignatureNonce", crypto.randomUUID()],
    ["SignatureVersion", "1.0"],
    ["Timestamp", new Date().toISOString().replace(/\.\d{3}Z$/, "Z")],
    ["Version", "2019-02-28"],
  ]);

  const canonicalizedQuery = [...params.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${percentEncode(key)}=${percentEncode(value)}`)
    .join("&");

  const stringToSign = `GET&${percentEncode("/")}&${percentEncode(canonicalizedQuery)}`;
  const signature = crypto
    .createHmac("sha1", `${env.accessKeySecret}&`)
    .update(stringToSign)
    .digest("base64");

  const endpoint = new URL(`https://nls-meta.${env.region}.aliyuncs.com/`);
  endpoint.searchParams.set("Signature", signature);

  for (const [key, value] of params) {
    endpoint.searchParams.set(key, value);
  }

  return endpoint.toString();
}

async function getAliyunToken(env: SpeechEnv) {
  if (env.token) {
    return env.token;
  }

  const now = Math.floor(Date.now() / 1000);
  if (tokenCache.token && tokenCache.expireAt && tokenCache.expireAt - now > 60) {
    return tokenCache.token;
  }

  const response = await fetch(createTokenRequestUrl(env));
  const payload = await response.json();

  if (!response.ok || !payload?.Token?.Id) {
    const message = payload?.Message || payload?.ErrMsg || "获取阿里云 Token 失败";
    throw new Error(message);
  }

  tokenCache.token = payload.Token.Id;
  tokenCache.expireAt = Number(payload.Token.ExpireTime || now + 300);
  return tokenCache.token;
}

async function readBody(req: IncomingMessage) {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

function sendJson(res: ServerResponse, statusCode: number, payload: unknown) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

function sendError(res: ServerResponse, statusCode: number, message: string, details?: unknown) {
  sendJson(res, statusCode, {
    ok: false,
    message,
    details,
  });
}

function getSpeechHost(region: string) {
  return `https://nls-gateway-${region}.aliyuncs.com`;
}

function getAsrTranscript(payload: any) {
  return String(payload?.result || payload?.Result || payload?.flash_result?.sentence || "").trim();
}

async function handleTts(req: IncomingMessage, res: ServerResponse) {
  const env = readSpeechEnv();
  if (!env.appKey) {
    return sendError(res, 503, "缺少环境变量 ALIYUN_NLS_APP_KEY");
  }

  if (!env.token && (!env.accessKeyId || !env.accessKeySecret)) {
    return sendError(res, 503, "缺少阿里云凭据，请配置 ALIYUN_AK_ID、ALIYUN_AK_SECRET 或 ALIYUN_NLS_TOKEN");
  }

  try {
    const rawBody = await readBody(req);
    const payload = rawBody.length ? JSON.parse(rawBody.toString("utf-8")) : {};
    const text = String(payload?.text || "").trim();

    if (!text) {
      return sendError(res, 400, "text 不能为空");
    }

    const token = await getAliyunToken(env);
    const endpoint = new URL(`${getSpeechHost(env.region)}/stream/v1/tts`);
    endpoint.searchParams.set("appkey", env.appKey);
    endpoint.searchParams.set("token", token);
    endpoint.searchParams.set("text", text);
    endpoint.searchParams.set("format", "wav");
    endpoint.searchParams.set("sample_rate", "16000");
    endpoint.searchParams.set("voice", env.voice);

    const response = await fetch(endpoint, { method: "GET" });
    if (!response.ok) {
      const errorText = await response.text();
      return sendError(res, response.status, "阿里云语音合成失败", errorText);
    }

    const audioBuffer = Buffer.from(await response.arrayBuffer());
    res.statusCode = 200;
    res.setHeader("Content-Type", response.headers.get("content-type") || "audio/wav");
    res.end(audioBuffer);
  } catch (error) {
    return sendError(res, 500, "语音合成请求失败", error instanceof Error ? error.message : String(error));
  }
}

async function handleAsr(req: IncomingMessage, res: ServerResponse) {
  const env = readSpeechEnv();
  if (!env.appKey) {
    return sendError(res, 503, "缺少环境变量 ALIYUN_NLS_APP_KEY");
  }

  if (!env.token && (!env.accessKeyId || !env.accessKeySecret)) {
    return sendError(res, 503, "缺少阿里云凭据，请配置 ALIYUN_AK_ID、ALIYUN_AK_SECRET 或 ALIYUN_NLS_TOKEN");
  }

  try {
    const audioBuffer = await readBody(req);
    if (!audioBuffer.length) {
      return sendError(res, 400, "录音数据不能为空");
    }

    const token = await getAliyunToken(env);
    const endpoint = new URL(`${getSpeechHost(env.region)}/stream/v1/asr`);
    endpoint.searchParams.set("appkey", env.appKey);
    endpoint.searchParams.set("format", "wav");
    endpoint.searchParams.set("sample_rate", "16000");
    endpoint.searchParams.set("enable_punctuation_prediction", "true");
    endpoint.searchParams.set("enable_inverse_text_normalization", "true");

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "X-NLS-Token": token,
        "Content-Type": "application/octet-stream",
      },
      body: audioBuffer,
    });

    const responseText = await response.text();
    let payload: any;

    try {
      payload = JSON.parse(responseText);
    } catch {
      payload = { raw: responseText };
    }

    if (!response.ok) {
      return sendError(res, response.status, "阿里云语音识别失败", payload);
    }

    return sendJson(res, 200, {
      ok: true,
      transcript: getAsrTranscript(payload),
      raw: payload,
    });
  } catch (error) {
    return sendError(res, 500, "语音识别请求失败", error instanceof Error ? error.message : String(error));
  }
}

export function aliyunSpeechProxy(): Plugin {
  return {
    name: "aliyun-speech-proxy",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const requestUrl = new URL(req.url || "/", "http://localhost");

        if (req.method === "POST" && requestUrl.pathname === "/api/aliyun-speech/tts") {
          return handleTts(req, res);
        }

        if (req.method === "POST" && requestUrl.pathname === "/api/aliyun-speech/asr") {
          return handleAsr(req, res);
        }

        return next();
      });
    },
  };
}
