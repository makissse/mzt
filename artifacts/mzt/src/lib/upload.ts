import { getStoredAuthToken } from '@workspace/api-client-react';

export async function uploadFile(file: File): Promise<string> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  const token = getStoredAuthToken();
  if (token) {
    headers['x-auth-token'] = token;
  }

  // 1) Request a presigned URL from the API server
  const metaRes = await fetch('/api/storage/uploads/request-url', {
    method: 'POST',
    credentials: 'include',
    headers,
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
    } catch {
      // ignore parse error
    }
    throw new Error(message);
  }

  const { uploadURL, objectPath } = await metaRes.json() as {
    uploadURL: string;
    objectPath: string;
  };

  // 2) Upload the file directly to the presigned GCS URL
  const uploadRes = await fetch(uploadURL, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
    },
  });

  if (!uploadRes.ok) {
    throw new Error('Ошибка загрузки файла в хранилище');
  }

  // 3) Return the local serving URL (objectPath already starts with /objects/)
  return `/api/storage${objectPath}`;
}
