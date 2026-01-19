export async function sendMessage(phone: string, message: string) {
  try {
    // Vite fornece `import.meta.env.VITE_API_URL` em tempo de build.
    const base = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL)
      ? String(import.meta.env.VITE_API_URL)
      : (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3333');

    const url = `${base.replace(/\/$/, '')}/webhook/frontzap`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, message }),
    });

    const data = await res.json();
    return data;
  } catch (err) {
    console.error('chatApi.sendMessage error', err);
    return { reply: '❌ Erro de conexão com o servidor' };
  }
}

export default { sendMessage };
