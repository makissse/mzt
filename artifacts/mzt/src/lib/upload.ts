export async function uploadFile(file: File): Promise<string> {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch('/api/upload', { method: 'POST', body: fd });
  if (!res.ok) {
    throw new Error('Upload failed');
  }
  const json = await res.json();
  return json.url as string;
}
