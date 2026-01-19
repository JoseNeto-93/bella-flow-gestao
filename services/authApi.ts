const API_BASE = import.meta.env.VITE_API_URL || window.location.origin;

export async function login(phone: string, apiKey: string) {
  const res = await fetch(`${API_BASE}/api/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ phone, apiKey }),
  });
  return res.json();
}

export async function fetchDashboard(token: string) {
  const res = await fetch(`${API_BASE}/api/dashboard`, {
    headers: { authorization: `Bearer ${token}` },
  });
  return res.json();
}
