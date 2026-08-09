/**
 * Free speech-to-text via Groq's hosted Whisper API.
 *
 * Provider: Groq (free developer tier — ~2,000 requests/day, no credit card).
 * Models: whisper-large-v3-turbo (fast) / whisper-large-v3.
 * Docs: https://console.groq.com/docs/speech-text
 *
 * We receive a base64-encoded audio string from the frontend,
 * decode it to a Buffer, and upload it to Groq as multipart/form-data.
 */

import { config } from '../config/config.js';

export interface TranscriptionResult {
  text: string;
  /** Average log-prob-based confidence proxy 0..1, if Groq returns it. */
  confidence: number;
}

const GROQ_STT_URL = 'https://api.groq.com/openai/v1/audio/transcriptions';
const GROQ_MODEL = 'whisper-large-v3-turbo';

/** Map a browser-recorded mime type to a Groq-friendly file extension. */
const extensionFor = (mimeType: string): string => {
  if (mimeType.includes('webm')) return 'webm';
  if (mimeType.includes('ogg')) return 'ogg';
  if (mimeType.includes('mp4') || mimeType.includes('m4a')) return 'mp4';
  if (mimeType.includes('mpeg')) return 'mp3';
  if (mimeType.includes('wav')) return 'wav';
  return 'webm';
};

/**
 * Build a multipart/form-data body manually (no browser FormData needed).
 * This works reliably in all Node.js versions without any extra packages.
 */
function buildMultipartBody(
  audioBuffer: Buffer,
  filename: string,
  mimeType: string
): { body: Buffer; boundary: string } {
  const boundary = `----EnglishBridge${Date.now()}`;

  const parts: Buffer[] = [];

  // Audio file part
  parts.push(Buffer.from(
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="file"; filename="${filename}"\r\n` +
    `Content-Type: ${mimeType}\r\n\r\n`
  ));
  parts.push(audioBuffer);
  parts.push(Buffer.from('\r\n'));

  // Model field
  parts.push(Buffer.from(
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="model"\r\n\r\n` +
    `${GROQ_MODEL}\r\n`
  ));

  // Response format
  parts.push(Buffer.from(
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="response_format"\r\n\r\n` +
    `verbose_json\r\n`
  ));

  // Language
  parts.push(Buffer.from(
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="language"\r\n\r\n` +
    `en\r\n`
  ));

  // Temperature
  parts.push(Buffer.from(
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="temperature"\r\n\r\n` +
    `0\r\n`
  ));

  // Closing boundary
  parts.push(Buffer.from(`--${boundary}--\r\n`));

  return {
    body: Buffer.concat(parts),
    boundary,
  };
}

/**
 * Transcribe a base64-encoded audio string using Groq Whisper (free tier).
 * Throws a typed Error on failure so the route can return 500/503.
 */
export const transcribeAudio = async (
  audioBase64: string,
  originalMimeType: string
): Promise<TranscriptionResult> => {
  if (!config.isGroqEnabled) {
    throw new Error('Groq transcription is not configured (GROQ_API_KEY missing)');
  }

  const ext = extensionFor(originalMimeType);
  const filename = `speech.${ext}`;
  const audioBuffer = Buffer.from(audioBase64, 'base64');

  const { body, boundary } = buildMultipartBody(audioBuffer, filename, originalMimeType);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const res = await fetch(GROQ_STT_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.groqApiKey}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
      },
      body: new Uint8Array(body),
      signal: controller.signal,
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      throw new Error(`Groq STT error ${res.status}: ${detail.slice(0, 500)}`);
    }

    const data: unknown = await res.json();
    const record = data as { segments?: unknown; text?: unknown } | null;

    // verbose_json returns segments with avg_logprob. Convert to 0..1 proxy.
    let confidence = 0.85; // sensible default
    const segments = record?.segments;
    if (Array.isArray(segments) && segments.length > 0) {
      const avgLogprob =
        segments.reduce(
          (sum, s) => sum + (typeof s.avg_logprob === 'number' ? s.avg_logprob : 0),
          0
        ) / segments.length;
      // avg_logprob is typically in [-1, 0]; map to ~[0.3, 1].
      confidence = Math.max(0, Math.min(1, Math.exp(avgLogprob)));
    }

    return {
      text: String(record?.text ?? '').trim(),
      confidence,
    };
  } finally {
    clearTimeout(timeout);
  }
};
