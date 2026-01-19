import React from 'react';

export function TermsView() {
  return (
    <div style={styles.container}>
      <h1>Termos de Serviço</h1>
      <p style={styles.date}>Última atualização: 10 de janeiro de 2026</p>

      <section>
        <h2>1. Aceitação dos Termos</h2>
        <p>
          Ao usar Bella Flow, você concorda com estes termos de serviço. Se você não concorda, não use o serviço.
        </p>
      </section>

      <section>
        <h2>2. Descrição do Serviço</h2>
        <p>
          Bella Flow é uma plataforma SaaS (Software as a Service) que oferece:
        </p>
        <ul>
          <li>Gerenciamento de agendamentos para salões de beleza</li>
          <li>Integração com WhatsApp via webhook FrontZap</li>
          <li>Chat inteligente com IA para atendimento automático</li>
          <li>Painel de administração para gestão de clientes</li>
        </ul>
      </section>

      <section>
        <h2>3. Planos e Pagamento</h2>
        <p>
          Os pagamentos são processados via Stripe. Você é responsável por manter seus dados de pagamento atualizados.
          Renovações automáticas ocorrem conforme o plano contratado.
        </p>
      </section>

      <section>
        <h2>4. Cancelamento</h2>
        <p>
          Você pode cancelar sua assinatura a qualquer momento pelo painel de administrador. Após cancelamento, o acesso será revogado.
        </p>
      </section>

      <section>
        <h2>5. Limitações de Responsabilidade</h2>
        <p>
          Bella Flow é fornecido "como está". Não garantimos disponibilidade 100% ou acurácia dos dados.
          Não somos responsáveis por perda de dados ou danos indiretos.
        </p>
      </section>

      <section>
        <h2>6. Lei Aplicável</h2>
        <p>
          Estes termos são regidos pelas leis do Brasil.
        </p>
      </section>

      <section>
        <h2>Contato</h2>
        <p>
          Em caso de dúvidas, entre em contato: contato@bellaflow.com
        </p>
      </section>
    </div>
  );
}

const styles: React.CSSProperties = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '40px 20px',
    fontFamily: 'system-ui, sans-serif',
    lineHeight: '1.6',
    color: '#333',
  },
} as any;
