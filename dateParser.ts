export function parseDateFromText(text: string): string | null {
  const lower = text.toLowerCase();
  const today = new Date();

  if (lower.includes('hoje')) {
    return formatDate(today);
  }

  if (lower.includes('amanhã') || lower.includes('amanha')) {
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    return formatDate(tomorrow);
  }

  const weekDays: Record<string, number> = {
    domingo: 0,
    segunda: 1,
    terça: 2,
    terca: 2,
    quarta: 3,
    quinta: 4,
    sexta: 5,
    sábado: 6,
    sabado: 6,
  };

  for (const day in weekDays) {
    if (lower.includes(day)) {
      const targetDay = weekDays[day];
      const result = new Date(today);
      const diff =
        (targetDay + 7 - today.getDay()) % 7 || 7;
      result.setDate(today.getDate() + diff);
      return formatDate(result);
    }
  }

  return null;
}

export function parseTimeFromText(text: string): string | null {
  const match = text.match(/(\d{1,2})[:h]?(\d{2})?/);

  if (!match) return null;

  const hour = match[1].padStart(2, '0');
  const minute = match[2] ? match[2] : '00';

  return `${hour}:${minute}`;
}

function formatDate(date: Date) {
  return date.toISOString().split('T')[0];
}
