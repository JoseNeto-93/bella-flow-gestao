# 🚀 Como Usar o Sistema Bella Flow

## 📋 Iniciar o Sistema

### Opção 1: Script Automático (Recomendado)
```powershell
.\start.ps1
```

### Opção 2: Manual

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

---

## 🎯 Como Testar o Sistema

### 1️⃣ **Primeiro Acesso**
1. Acesse: http://localhost:3000
2. Clique em **"Cadastrar"** (botão verde)
3. Preencha:
   - Nome do salão: Ex: "Salão Bella"
   - Telefone: Ex: "11999999999"
   - Senha: Ex: "senha123"
4. Escolha um plano e clique **"Assinar"**

### 2️⃣ **Ver e Editar Serviços**
1. Clique no ícone de **Perfil** (👤) no menu inferior
2. Clique em **"Catálogo de Serviços"**
3. Você verá 11 serviços cadastrados:
   - Manicure, Pedicure, Alongamento
   - Pintar Cabelo, Progressiva, Penteado
   - Corte, Escova, Hidratação
   - Design de Sobrancelha
   - Outro Serviço

4. Para editar:
   - Clique no campo e altere nome/preço/duração
   - Clique **"Salvar Alterações"**

### 3️⃣ **Fazer um Agendamento (Simulador)**
1. Clique no ícone de **Chat** (💬) no topo
2. Digite: "Oi"
3. IA responde com lista de serviços
4. Digite: "Quero fazer unha"
5. Digite a data: "15/01"
6. IA mostra horários disponíveis
7. Digite o horário: "14:00"
8. ✅ Agendamento confirmado!

### 4️⃣ **Ver Agendamentos**
1. Clique no ícone de **Agenda** (📅) no menu inferior
2. Você verá todos os agendamentos
3. Pode marcar como concluído ou remover

---

## ⚠️ Problemas Comuns

### Sistema não abre?
```powershell
# Matar processos nas portas
Get-NetTCPConnection -LocalPort 3000 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
Get-NetTCPConnection -LocalPort 3333 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }

# Reiniciar
.\start.ps1
```

### Agendamentos não aparecem?
- Verifique se o backend está rodando (porta 3333)
- Recarregue a página (F5)

### Erro ao cadastrar?
- Verifique se preencheu todos os campos
- Use telefone sem espaços: "11999999999"

---

## 📊 Estrutura do Sistema

```
Bella Flow/
├── backend/          → API (porta 3333)
│   ├── server.js     → Servidor principal
│   ├── dataService.js → Banco de dados
│   └── messageProcessor.js → IA de agendamento
│
├── services/         → APIs do frontend
│   ├── chatApi.ts    → Chat com IA
│   └── billingApi.ts → Pagamentos
│
├── views/            → Telas
│   ├── HomeView.tsx         → Tela inicial
│   ├── AgendaView.tsx       → Lista de agendamentos
│   ├── SettingsView.tsx     → Configurações
│   └── ServicesEditView.tsx → Editar serviços
│
└── App.tsx           → App principal
```

---

## ✅ Checklist de Funcionalidades

- [x] Cadastro de salão
- [x] Login automático
- [x] 11 serviços pré-cadastrados
- [x] Editar serviços (nome, preço, duração)
- [x] Adicionar novos serviços
- [x] Remover serviços
- [x] Chat IA para agendamento
- [x] Reconhecimento de linguagem natural
- [x] Agenda de horários
- [x] Marcar como concluído
- [x] Dashboard com métricas
- [x] Integração com Supabase
- [x] Backend com autenticação

---

## 🎨 Serviços Disponíveis

| Categoria | Serviços |
|-----------|----------|
| **💅 Unhas** | Manicure (R$ 50), Pedicure (R$ 60), Alongamento (R$ 150) |
| **💇 Cabelo** | Pintar (R$ 180), Progressiva (R$ 350), Penteado (R$ 120), Corte (R$ 100), Escova (R$ 80), Hidratação (R$ 100) |
| **✨ Outros** | Design de Sobrancelha (R$ 45), Outro Serviço (R$ 80) |

---

## 🔧 Configuração Supabase

Já configurado! Credenciais em:
- Backend: `backend/.env`
- Produção: `.env.production`

---

## 🚀 Próximos Passos

1. ✅ Testar todas as funcionalidades
2. 📸 Tirar prints das telas
3. 🎨 Personalizar cores (opcional)
4. 🌐 Fazer deploy em produção

---

**Precisa de ajuda?** Revise os passos acima ou peça suporte! 🙂
