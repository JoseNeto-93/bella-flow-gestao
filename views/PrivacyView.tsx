import React from 'react';

export function PrivacyView() {
  return (
    <div style={styles.container}>
      <h1>Política de Privacidade</h1>
      <p style={styles.date}>Última atualização: 10 de janeiro de 2026</p>

      <section>
        <h2>1. Coleta de Dados</h2>
        <p>
          Coletamos as seguintes informações quando você usa Bella Flow:
        </p>
        <ul>
          <li>Nome e telefone do seu salão</li>
          <li>Dados de pagamento (processados via Stripe)</li>
          <li>Histórico de agendamentos e mensagens</li>
          <li>Informações de uso da plataforma</li>
        </ul>
      </section>

      <section>
        <h2>2. Uso dos Dados</h2>
        <p>
          Seus dados são usados para:
        </p>
        <ul>
          <li>Fornecer e melhorar o serviço</li>
          <li>Processar pagamentos</li>
          <li>Comunicação relacionada ao serviço</li>
          <li>Análise de uso e estatísticas (anonimizadas)</li>
        </ul>
      </section>

      <section>
        <h2>3. Segurança dos Dados</h2>
        <p>
          Utilizamos HTTPS, encriptação de dados sensíveis e armazenamento seguro em Supabase/Postgres.
          Acesso a dados é restrito e auditado.
        </p>
      </section>

      <section>
        <h2>4. Compartilhamento de Dados</h2>
        <p>
          Seus dados NÃO são compartilhados com terceiros, exceto:
        </p>
        <ul>
          <li>Stripe (para processamento de pagamentos)</li>
          <li>Supabase (para armazenamento seguro)</li>
          <li>Quando legalmente obrigado</li>
        </ul>
      </section>

      <section>
        <h2>5. Direitos do Usuário (LGPD)</h2>
        <p>
          Conforme a Lei Geral de Proteção de Dados (LGPD), você tem direito a:
        </p>
        <ul>
          <li>Acessar seus dados pessoais</li>
          <li>Corrigir dados incorretos</li>
          <li>Solicitar exclusão de dados</li>
          <li>Portabilidade de dados</li>
        </ul>
        <p>Para exercer esses direitos, contate: privacidade@bellaflow.com</p>
      </section>

      <section>
        <h2>6. Retenção de Dados</h2>
        <p>
          Dados são mantidos enquanto sua conta está ativa. Após cancelamento, dados são retidos por 30 dias
          e então excluídos permanentemente.
        </p>
      </section>

      <section>
        <h2>7. Alterações na Política</h2>
        <p>
          Podemos atualizar esta política periodicamente. Notificações de mudanças importantes serão enviadas.
        </p>
      </section>

      <section>
        <h2>Contato</h2>
        <p>
          Dúvidas sobre privacidade? Entre em contato: privacidade@bellaflow.com
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
