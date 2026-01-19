
import React from 'react';
import { Appointment, SalonConfig } from '../types';
import { calculateBillingMetrics, formatCurrency } from '../services/dataService';
import { ArrowRight, Star, Calendar, TrendingUp, Users, Clock } from 'lucide-react';

interface Props {
  appointments: Appointment[];
  config: SalonConfig;
  onNavigateToAgenda: () => void;
}

const HomeView: React.FC<Props> = ({ appointments, config, onNavigateToAgenda }) => {
  const metrics = calculateBillingMetrics(appointments);
  const today = new Date().toISOString().split('T')[0];
  const nextAppointment = appointments
    .filter(a => a.date >= today && a.status === 'scheduled')
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))[0];

  return (
    <div className="py-2 space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Glass Revenue Card */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[40px] p-8 text-white premium-shadow relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
          <TrendingUp size={120} />
        </div>
        
        <div className="relative z-10 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Saldo do Dia</p>
              <h2 className="text-4xl font-extrabold mt-1 tracking-tight">{formatCurrency(metrics.todayRevenue)}</h2>
            </div>
            <div className="bg-emerald-400/20 text-emerald-400 px-3 py-1 rounded-full text-[10px] font-bold border border-emerald-400/20 backdrop-blur-md">
              +12% vs ontem
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
            <div>
              <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest flex items-center gap-1.5">
                <Users size={12} className="text-rose-400" /> Clientes
              </p>
              <p className="text-xl font-bold mt-1">{metrics.count}</p>
            </div>
            <div>
              <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest flex items-center gap-1.5">
                <Star size={12} className="text-amber-400" /> Ticket
              </p>
              <p className="text-xl font-bold mt-1">{formatCurrency(metrics.ticketMedio)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Next Slot - Glass Style */}
      <section className="space-y-4">
        <div className="flex justify-between items-end px-2">
          <h3 className="text-lg font-extrabold text-white tracking-tight">Próximo Horário</h3>
          <button onClick={onNavigateToAgenda} className="text-rose-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1 hover:gap-2 transition-all">
            Ver Agenda <ArrowRight size={14} />
          </button>
        </div>
        
        {nextAppointment ? (
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[32px] p-6 premium-shadow flex items-center gap-4 group active:scale-[0.98] transition-transform">
            <div className="relative">
               <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-white font-extrabold text-2xl border border-white/10 shadow-inner">
                {nextAppointment.customerName[0]}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-rose-500 rounded-full border-2 border-white/20 flex items-center justify-center">
                 <Clock size={10} className="text-white" />
              </div>
            </div>
            
            <div className="flex-1">
              <h4 className="font-extrabold text-white text-lg leading-tight">{nextAppointment.customerName}</h4>
              <p className="text-xs text-white/50 font-semibold flex items-center gap-1 mt-1">
                {nextAppointment.service}
              </p>
            </div>
            
            <div className="text-right">
              <p className="text-xl font-black text-rose-400">{nextAppointment.time}</p>
              <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider">
                {nextAppointment.date === today ? 'Hoje' : nextAppointment.date}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white/5 backdrop-blur-md rounded-[32px] p-12 text-center border-2 border-dashed border-white/10">
            <Calendar className="mx-auto text-white/10 mb-4" size={40} />
            <p className="text-white/30 text-sm font-medium">Tudo tranquilo por agora.</p>
          </div>
        )}
      </section>

      {/* Quick Insight Banner - Saturated Pink */}
      <div className="bg-gradient-to-br from-rose-600 to-pink-500 rounded-[32px] p-6 text-white relative overflow-hidden shadow-2xl shadow-rose-900/20">
        <div className="relative z-10 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-rose-100/60 text-[10px] font-bold uppercase tracking-widest">Insight da IA</p>
            <h4 className="text-lg font-extrabold leading-tight">Sua "{metrics.topService}"<br/>está bombando!</h4>
          </div>
          <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md border border-white/20">
            <TrendingUp size={28} className="text-white" />
          </div>
        </div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white rounded-full blur-3xl opacity-20"></div>
      </div>
    </div>
  );
};

export default HomeView;
