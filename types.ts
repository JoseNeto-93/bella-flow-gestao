
export type Intencao = 
  | 'agendamento' 
  | 'cancelamento' 
  | 'reagendamento' 
  | 'confirmacao' 
  | 'consulta' 
  | 'preco' 
  | 'servicos' 
  | 'finalizacao' 
  | 'pagamento' 
  | 'conversa';

export type AcaoSistema = 
  | 'criar_agenda' 
  | 'atualizar_agenda' 
  | 'cancelar_agenda' 
  | 'nenhuma';

export interface AIResponse {
  intencao: Intencao;
  servico: string | null;
  data: string | null; // YYYY-MM-DD
  hora: string | null; // HH:MM
  valor_estimado: number | null;
  nome_cliente: string | null;
  mensagem_resposta: string;
  acao_sistema: AcaoSistema;
}

export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number; // in minutes
}

export interface Appointment {
  id: string;
  customerName: string;
  service: string;
  date: string;
  time: string;
  value: number;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface SalonConfig {
  name: string;
  services: Service[];
  openingHours: {
    start: string;
    end: string;
  };
}
