export class ApiError extends Error { constructor(public status: number, message: string) { super(message); } }
export async function request<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const [route, query = ''] = path.split('?');
    const quiz = location.pathname.startsWith('/test/') ? decodeURIComponent(location.pathname.slice(6).replace(/\/$/, '')) : 'pm';
    const params = new URLSearchParams(query);
    params.set('route', route);
    if (!params.has('quiz')) params.set('quiz', quiz);
    const response = await fetch(`/api?${params}`, { method, credentials: 'same-origin', cache: 'no-store', signal: controller.signal,
      ...(body === undefined ? {} : { headers: { 'Content-Type':'application/json' }, body: JSON.stringify(body) }) });
    const data = await response.json().catch(() => ({ error: 'Respons server tidak dapat dibaca.' }));
    if (!response.ok) throw new ApiError(response.status, data.error || 'Request gagal.');
    return data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new Error('Koneksi terputus atau terlalu lama. Coba simpan kembali.');
  } finally { clearTimeout(timeout); }
}
