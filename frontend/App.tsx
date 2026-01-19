import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard,
  Calendar,
  MessageCircle,
  DollarSign,
  TrendingUp,
  Scissors,
  Smartphone,
  Zap,
  ChevronRight,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Bell,
  Layers,
  Target,
  Crown,
  Play,
  X,
  ArrowUpRight,
  UserCircle2,
  Gem
} from 'lucide-react';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

import { Appointment, View, SalonConfig } from './types';
import { INITIAL_SERVICES } from './constants';

/* =========================
   COMPONENTES AUXILIARES
========================= */

const MetricCard = ({ title, value, trend, icon }: any) => (
  <div className="glass-card p-6 rounded-3xl relative">
    <div className="flex justify-between items-center mb-4">
      <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-[#ff007a]">
        {icon}
      </div>
      {trend && (
        <span className="text-xs text-[#ff007a] font-bold">{trend}</span>
      )}
    </div>
    <p className="text-xs uppercase text-white/40">{title}</p>
    <h3 className="text-3xl font-bold text-white">{value}</h3>
  </div>
);

/* =========================
   APP PRINCIPAL
========================= */

export default function App() {
  const [salon, setSalon] = useState<SalonConfig>(() => {
    const saved = localStorage.getItem('bellaflow_salon');
    return saved
      ? JSON.parse(saved)
      : { name: '', setupComplete: false, niche: 'Beauty' };
  });

  const [backendUrl] = useState(
    (window as any).CONFIG_BACKEND_URL ||
    localStorage.getItem('bellaflow_backend_url') ||
    'http://localhost:3001'
  );

  const [activeView, setActiveView] = useState<View>(
    salon.setupComplete ? 'dashboard' : 'onboarding'
  );

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('bellaflow_appointments');
    return saved ? JSON.parse(saved) : [];
  });

  const [waMessage, setWaMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [tempBooking, setTempBooking] = useState<any>(null);
  const [connStatus, setConnStatus] = useState('OFFLINE');

  /* =========================
     PERSISTÊNCIA
  ========================= */

  useEffect(() => {
    localStorage.setItem('bellaflow_salon', JSON.stringify(salon));
    localStorage.setItem('bellaflow_appointments', JSON.stringify(appointments));
  }, [salon, appointments]);

  /* =========================
     STATUS BACKEND
  ========================= */

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch(`${backendUrl}/status`);
        const data = await res.json();
        setConnStatus(data.status || 'CONNECTED');
      } catch {
        setConnStatus('OFFLINE');
      }
    };
    checkStatus();
    const i = setInterval(checkStatus, 10000);
    return () => clearInterval(i);
  }, [backendUrl]);

  /* =========================
     MÉTRICAS
  ========================= */

  const totalRevenue = useMemo(
    () => appointments.reduce((sum, a) => sum + a.price, 0),
    [appointments]
  );

  const revenueChartData = useMemo(
    () =>
      appointments.slice(-10).map(a => ({
        date: a.time,
        valor: a.price
      })),
    [appointments]
  );

  /* =========================
     ONBOARDING → BACKEND
  ========================= */

  const handleOnboarding = async (text: string) => {
    if (!text.trim()) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`${backendUrl}/api/branding`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      const data = await res.json();
      setSalon({
        name: data.salonName || text,
        setupComplete: true,
        niche: 'Beauty'
      });
      setActiveView('dashboard');
    } catch {
      setSalon({ name: text, setupComplete: true, niche: 'Beauty' });
      setActiveView('dashboard');
    } finally {
      setIsProcessing(false);
    }
  };

  /* =========================
     WHATSAPP → BACKEND
  ========================= */

  const processMessage = async () => {
    if (!waMessage.trim()) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`${backendUrl}/api/extract`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: waMessage })
      });
      const data = await res.json();
      setTempBooking(data);
    } catch {
      alert('Erro ao processar mensagem');
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmBooking = () => {
    if (!tempBooking) return;

    const service =
      INITIAL_SERVICES.find(s =>
        s.name.toLowerCase().includes(tempBooking.serviceName?.toLowerCase())
      ) || INITIAL_SERVICES[0];

    const newAppointment: Appointment = {
      id: crypto.randomUUID(),
      clientName: tempBooking.clientName,
      serviceId: service.id,
      serviceName: service.name,
      date: tempBooking.date,
      time: tempBooking.time,
      price: service.price,
      status: 'Confirmado',
      createdAt: new Date().toISOString()
    };

    setAppointments(prev => [...prev, newAppointment]);
    setTempBooking(null);
    setWaMessage('');
    setActiveView('dashboard');
  };

  /* =========================
     TELAS
  ========================= */

  if (activeView === 'onboarding') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-12 rounded-3xl text-center space-y-6">
          <Scissors className="mx-auto text-[#ff007a]" size={48} />
          <h1 className="text-4xl font-bold text-white">BellaFlow</h1>
          <input
            placeholder="Nome do seu salão"
            className="w-full p-4 rounded-xl bg-black/40 text-white"
            onKeyDown={e =>
              e.key === 'Enter' &&
              handleOnboarding((e.target as HTMLInputElement).value)
            }
          />
          <button
            onClick={() =>
              handleOnboarding(
                (document.querySelector('input') as HTMLInputElement).value
              )
            }
            className="btn-premium w-full py-4"
          >
            {isProcessing ? 'Processando...' : 'Entrar'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-10 space-y-10">
      <h2 className="text-4xl font-bold text-white">
        Dashboard — {salon.name}
      </h2>

      <div className="grid grid-cols-4 gap-6">
        <MetricCard
          title="Faturamento"
          value={`R$ ${totalRevenue}`}
          icon={<DollarSign />}
        />
        <MetricCard
          title="Agendamentos"
          value={appointments.length}
          icon={<Calendar />}
        />
        <MetricCard title="IA" value="99%" icon={<Zap />} />
        <MetricCard title="Plano" value="VIP" icon={<Gem />} />
      </div>

      <div className="glass-card p-6 rounded-3xl">
        <textarea
          value={waMessage}
          onChange={e => setWaMessage(e.target.value)}
          className="w-full p-6 rounded-xl bg-black/40 text-white"
          placeholder="Cole mensagens do WhatsApp..."
        />
        <button
          onClick={processMessage}
          className="btn-premium w-full mt-4"
        >
          {isProcessing ? 'Analisando...' : 'Analisar com IA'}
        </button>
      </div>

      {tempBooking && (
        <div className="glass-card p-8 rounded-3xl text-center">
          <h3 className="text-2xl text-white mb-4">
            Confirmar Agendamento
          </h3>
          <p className="text-white/60">
            {tempBooking.clientName} — {tempBooking.serviceName}
          </p>
          <button
            onClick={confirmBooking}
            className="btn-premium mt-6"
          >
            Confirmar
          </button>
        </div>
      )}
    </div>
  );
}
