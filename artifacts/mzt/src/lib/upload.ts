import { getStoredAuthToken } from '@workspace/api-client-react';

function authHeaders(json = true): Record<string, string> {
  const headers: Record<string, string> = {};
  if (json) headers['Content-Type'] = 'application/json';
  const token = getStoredAuthToken();
  if (token) headers['x-auth-token'] = token;
  return headers;
}

/** Upload via Replit Object Storage (presigned URL flow). */
async function uploadViaObjectStorage(file: File): Promise<string> {
  const metaRes = await fetch('/api/storage/uploads/request-url', {
    method: 'POST',
    credentials: 'include',
    headers: authHeaders(true),
    body: JSON.stringify({
      name: file.name,
      size: file.size,
      contentType: file.type || 'application/octet-stream',
    }),
  });

  if (!metaRes.ok) {
    let message = 'Ошибка загрузки файла';
    try {
      const json = await metaRes.json();
      if (json?.error) message = json.error;
    } catch { /* ignore */ }
    throw new Error(message);
  }

  const { uploadURL, objectPath } = await metaRes.json() as {
    uploadURL: string;
    objectPath: string;
  };

  const uploadRes = await fetch(uploadURL, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type || 'application/octet-stream' },
  });

  if (!uploadRes.ok) {
    throw new Error('Ошибка загрузки файла в хранилище');
  }

  // objectPath already starts with /objects/
  return `/api/storage${objectPath}`;
}

/** Fallback: upload directly to the server via multipart form. */
async function uploadViaServer(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const headers: Record<string, string> = {};
  const token = getStoredAuthToken();
  if (token) headers['x-auth-token'] = token;

  const res = await fetch('/api/upload', {
    method: 'POST',
    credentials: 'include',
    headers,
    body: formData,
  });

  if (!res.ok) {
    let message = 'Ошибка загрузки файла';
    try {
      const json = await res.json();
      if (json?.error) message = json.error;
    } catch { /* ignore */ }
    throw new Error(message);
  }

  const { url } = await res.json() as { url: string };
  return url;
}

/**
 * Upload a file and return its serving URL.
 * Tries Object Storage first; falls back to local server upload if unavailable.
 */
export async function uploadFile(file: File): Promise<string> {
  try {
    return await uploadViaObjectStorage(file);
  } catch (err) {
    // If object storage isn't configured (500), fall back to server-side upload
    const message = err instanceof Error ? err.message : '';
    const isConfigError =
      message.includes('не настроено') ||
      message.includes('Failed to generate') ||
      message.includes('not set') ||
      message.includes('Ошибка загрузки файла');
    if (isConfigError) {
      return await uploadViaServer(file);
    }
    throw err;
  }
}
