import { getStoredAuthToken } from '@workspace/api-client-react';

export async function uploadFile(file: File): Promise<string> {
  const fd = new FormData();
  fd.append('file', file);

  const headers: HeadersInit = {};
  const token = getStoredAuthToken();
  if (token) {
    headers['x-auth-token'] = token;
  }

  const res = await fetch('/api/upload', {
    method: 'POST',
    body: fd,
    credentials: 'include',
    headers,
  });

  if (!res.ok) {
    let message = 'Ошибка загрузки файла';
    try {
      const json = await res.json();
      if (json?.error) message = json.error;
    } catch {
      // ignore parse error
    }
    throw new Error(message);
  }

  const json = await res.json();
  return json.url as string;
}
