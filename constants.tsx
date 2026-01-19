import { Service, SalonConfig } from './types';

// 💅 Serviços padrão do salão
export const DEFAULT_SERVICES: Service[] = [
  // Unhas
  { id: '1', name: 'Manicure', price: 50, duration: 60 },
  { id: '2', name: 'Pedicure', price: 60, duration: 60 },
  { id: '3', name: 'Alongamento de Unhas', price: 150, duration: 120 },
  // Cabelo
  { id: '4', name: 'Pintar Cabelo', price: 180, duration: 120 },
  { id: '5', name: 'Progressiva', price: 350, duration: 180 },
  { id: '6', name: 'Penteado', price: 120, duration: 90 },
  { id: '7', name: 'Corte Feminino', price: 100, duration: 60 },
  { id: '8', name: 'Escova', price: 80, duration: 60 },
  { id: '9', name: 'Hidratação', price: 100, duration: 90 },
  // Outros
  { id: '10', name: 'Design de Sobrancelha', price: 45, duration: 30 },
  { id: '11', name: 'Outro Serviço', price: 80, duration: 60 },
];

// ⏱️ Duração dos serviços (mapa automático para agenda)
export const SERVICE_DURATION: Record<string, number> = {
  default: 60,
};

DEFAULT_SERVICES.forEach(service => {
  SERVICE_DURATION[service.name.toLowerCase()] = service.duration;
});

// 🏪 Configuração padrão do salão
export const DEFAULT_CONFIG: SalonConfig = {
  name: 'Bella Flow',
  services: DEFAULT_SERVICES,
  openingHours: {
    start: '08:00',
    end: '19:00',
  },
};
