import { transcribePcm16kMono } from '../lib/advisorSpeechServer';

function decodePcmBase64(pcmBase64: string): Float32Array | null {
  try {
    const raw = Buffer.from(pcmBase64, 'base64');
    if (raw.byteLength < 2) {
      return null;
    }
    const sampleCount = Math.floor(raw.byteLength / 2);
    const float32 = new Float32Array(sampleCount);
    for (let index = 0; index < sampleCount; index += 1) {
      const int16 = raw.readInt16LE(index * 2);
      float32[index] = int16 / (int16 < 0 ? 0x8000 : 0x7fff);
    }
    return float32;
  } catch {
    return null;
  }
}

function parseJsonSamples(body: Record<string, unknown>): Float32Array | null {
  if (typeof body.pcmBase64 === 'string' && body.pcmBase64.trim()) {
    return decodePcmBase64(body.pcmBase64.trim());
  }

  if (Array.isArray(body.samples) && body.samples.length > 0) {
    const valid = body.samples.every(
      (value) => typeof value === 'number' && Number.isFinite(value),
    );
    if (valid) {
      return new Float32Array(body.samples as number[]);
    }
  }

  return null;
}

export function isValidSpeechTranscribeJson(body: unknown): body is {
  pcmBase64?: string;
  samples?: number[];
  sampleRate: number;
} {
  if (!body || typeof body !== 'object') {
    return false;
  }
  const record = body as Record<string, unknown>;
  if (record.sampleRate !== 16_000) {
    return false;
  }
  return parseJsonSamples(record) != null;
}

export async function transcribeAdvisorSpeechFromJson(body: {
  pcmBase64?: string;
  samples?: number[];
  sampleRate: number;
}) {
  const record = body as Record<string, unknown>;
  const samples = parseJsonSamples(record);
  if (!samples) {
    throw new Error('音频数据无效');
  }
  const text = await transcribePcm16kMono(samples);
  return { text };
}

export async function transcribeAdvisorSpeechFromPcm(raw: Buffer) {
  if (raw.byteLength % 4 !== 0) {
    throw new Error('音频格式无效');
  }
  const arrayBuffer = raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength);
  const samples = new Float32Array(arrayBuffer);
  const text = await transcribePcm16kMono(samples);
  return { text };
}
