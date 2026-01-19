import React, { useState } from 'react';
import billingApi from '../services/billingApi';

interface Props {
  onClose: () => void;
}

export default function SignupModal({ onClose }: Props) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [plan, setPlan] = useState('starter');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async () => {
    setError('');
    if (!name || !phone || !password) return setError('Preencha todos os campos.');
    setLoading(true);
    const reg = await billingApi.registerSalon(name, phone, password, plan);
    if (reg?.error) {
      setError('Erro ao registrar.');
      setLoading(false);
      return;
    }

    // Salvar credenciais no localStorage para login automático
    const { id, apiKey } = reg;
    if (apiKey) {
      localStorage.setItem('apiKey', apiKey);
      localStorage.setItem('phone', phone);
      
      // Redirecionar para o dashboard
      window.location.href = '/';
      return;
    }

    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div className="bg-neutral-900 rounded-2xl p-6 w-[min(420px,92%)]">
        <h3 className="text-white text-lg font-bold mb-4">Cadastrar Salão</h3>
        {error && <div className="text-red-400 mb-2">{error}</div>}
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Nome do salão" className="w-full mb-2 p-2 rounded text-black" />
        <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Telefone (ex: 11999999999)" className="w-full mb-2 p-2 rounded text-black" />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Senha" className="w-full mb-2 p-2 rounded text-black" />
        <select value={plan} onChange={e => setPlan(e.target.value)} className="w-full mb-4 p-2 rounded text-black">
          <option value="starter">Starter - R$97</option>
          <option value="pro">Pro - R$197</option>
          <option value="agency">Agency - R$497</option>
        </select>
        <div className="flex gap-2">
          <button onClick={handleSignup} disabled={loading} className="flex-1 bg-rose-600 p-2 rounded text-white">{loading ? 'Aguarde...' : 'Assinar'}</button>
          <button onClick={onClose} className="flex-1 bg-white/10 p-2 rounded text-white">Cancelar</button>
        </div>
      </div>
    </div>
  );
}
