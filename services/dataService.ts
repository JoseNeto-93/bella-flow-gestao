// src/dataService.ts

export function formatCurrency(value: number | undefined): string {
  if (value === undefined || value === null || isNaN(value)) {
    return 'R$ 0,00';
  }
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function calculateBillingMetrics(appointments: any[]) {
  const total = appointments.reduce((sum, item) => sum + (item.value || item.price || 0), 0);
  const count = appointments.length || 0;
  const ticketMedio = count ? total / count : 0;

  // todayRevenue: soma de agendamentos para hoje
  const today = new Date().toISOString().split('T')[0];
  const todayRevenue = appointments
    .filter(a => a.date === today)
    .reduce((s, a) => s + (a.value || a.price || 0), 0);

  // topService: serviço mais agendado
  const freq: Record<string, number> = {};
  appointments.forEach(a => {
    const name = a.service || a.serviceName || a.service?.name || '—';
    freq[name] = (freq[name] || 0) + 1;
  });
  const topService = Object.keys(freq).sort((a, b) => (freq[b] || 0) - (freq[a] || 0))[0] || '-';

  return {
    total,
    formattedTotal: formatCurrency(total),
    count,
    ticketMedio,
    todayRevenue,
    topService,
  };
}
