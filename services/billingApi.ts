export async function registerSalon(name: string, phone: string, password: string, plan = 'starter') {
  try {
    const res = await fetch((typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) ? `${String(import.meta.env.VITE_API_URL)}/api/register` : `/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, password, plan }),
    });
    return await res.json();
  } catch (err) {
    console.error('registerSalon error', err);
    return { error: 'network' };
  }
}

export async function createCheckout(apiKey: string, plan: string, success_url?: string, cancel_url?: string) {
  try {
    const res = await fetch((typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) ? `${String(import.meta.env.VITE_API_URL)}/api/create-subscription-session` : `/api/create-subscription-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey, plan, success_url, cancel_url }),
    });
    return await res.json();
  } catch (err) {
    console.error('createCheckout error', err);
    return { error: 'network' };
  }
}

export default { registerSalon, createCheckout };
