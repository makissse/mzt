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

/**
 * Upload a file and return its serving URL.
 * All persistent media must go to Object Storage. Never fall back to the
 * deployment filesystem: that filesystem is replaced during republish.
 */
export async function uploadFile(file: File): Promise<string> {
  return uploadViaObjectStorage(file);
}
