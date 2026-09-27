const PROTOCOL_VERSION = "v1";
const ALGORITHM = "RSA-OAEP-256/A256GCM";

export interface HybridEnvelope {
  version: string;
  algorithm: string;
  encryptedKey?: string;
  iv: string;
  encryptedData: string;
}

interface PublicKeyResponse {
  algorithm: "RSA-OAEP-256";
  publicKey: string;
}

export interface HybridSession {
  encryptedKey: string;
  aesKey: CryptoKey;
}

let publicKeyPromise: Promise<CryptoKey> | null = null;

function base64Encode(bytes: ArrayBuffer | Uint8Array): string {
  const data = new Uint8Array(bytes);
  let binary = "";
  for (let index = 0; index < data.length; index += 0x8000) {
    binary += String.fromCharCode(...data.subarray(index, index + 0x8000));
  }
  return btoa(binary);
}

function base64Decode(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

function subtleCrypto(): SubtleCrypto {
  if (typeof window === "undefined" || !window.crypto?.subtle) {
    throw new Error("A criptografia híbrida só pode ser executada no navegador.");
  }
  return window.crypto.subtle;
}

async function getPublicKey(): Promise<CryptoKey> {
  if (!publicKeyPromise) {
    publicKeyPromise = (async () => {
      const response = await fetch("/api/crypto/public-key", { cache: "force-cache" });
      if (!response.ok) throw new Error("Não foi possível obter a chave pública do servidor.");

      const payload = (await response.json()) as PublicKeyResponse;
      if (payload.algorithm !== "RSA-OAEP-256" || !payload.publicKey) {
        throw new Error("A chave pública fornecida pelo servidor é inválida.");
      }

      return subtleCrypto().importKey(
        "spki",
        toArrayBuffer(base64Decode(payload.publicKey)),
        { name: "RSA-OAEP", hash: "SHA-256" },
        false,
        ["encrypt"]
      );
    })().catch((error) => {
      publicKeyPromise = null;
      throw error;
    });
  }
  return publicKeyPromise;
}

function aad(prefix: "" | "RESPONSE:", method: string, path: string): Uint8Array {
  const route = path.split("?")[0];
  return new TextEncoder().encode(`${prefix}${method}:${route}`);
}

async function encryptAesGcm(aesKey: CryptoKey, plainText: string, additionalData: Uint8Array): Promise<Pick<HybridEnvelope, "iv" | "encryptedData">> {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await subtleCrypto().encrypt(
    { name: "AES-GCM", iv: toArrayBuffer(iv), additionalData: toArrayBuffer(additionalData), tagLength: 128 },
    aesKey,
    toArrayBuffer(new TextEncoder().encode(plainText))
  );
  return { iv: base64Encode(iv), encryptedData: base64Encode(ciphertext) };
}

export async function createHybridSession(): Promise<HybridSession> {
  const rawAesKey = window.crypto.getRandomValues(new Uint8Array(32));
  const crypto = subtleCrypto();
  const aesKey = await crypto.importKey("raw", toArrayBuffer(rawAesKey), "AES-GCM", false, ["encrypt", "decrypt"]);
  const encryptedKey = await crypto.encrypt({ name: "RSA-OAEP" }, await getPublicKey(), toArrayBuffer(rawAesKey));
  return { aesKey, encryptedKey: base64Encode(encryptedKey) };
}

export async function encryptRequestBody(session: HybridSession, method: string, path: string, body: unknown): Promise<HybridEnvelope> {
  const encrypted = await encryptAesGcm(session.aesKey, JSON.stringify(body), aad("", method, path));
  return {
    version: PROTOCOL_VERSION,
    algorithm: ALGORITHM,
    encryptedKey: session.encryptedKey,
    ...encrypted,
  };
}

export function isHybridEnvelope(value: unknown): value is HybridEnvelope {
  if (!value || typeof value !== "object") return false;
  const envelope = value as Partial<HybridEnvelope>;
  return envelope.version === PROTOCOL_VERSION
    && envelope.algorithm === ALGORITHM
    && typeof envelope.iv === "string"
    && typeof envelope.encryptedData === "string";
}

export async function decryptResponse<T>(session: HybridSession, method: string, path: string, envelope: HybridEnvelope): Promise<T> {
  const plaintext = await subtleCrypto().decrypt(
    {
      name: "AES-GCM",
      iv: toArrayBuffer(base64Decode(envelope.iv)),
      additionalData: toArrayBuffer(aad("RESPONSE:", method, path)),
      tagLength: 128,
    },
    session.aesKey,
    toArrayBuffer(base64Decode(envelope.encryptedData))
  );
  return JSON.parse(new TextDecoder().decode(plaintext)) as T;
}
