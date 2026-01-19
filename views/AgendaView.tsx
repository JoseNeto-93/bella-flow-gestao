
import React, { useState } from 'react';
import { Appointment } from '../types';
import { formatCurrency } from '../services/dataService';
import { Search, CheckCircle2, Trash2, Clock, CalendarDays, Filter } from 'lucide-react';

interface Props {
  appointments: Appointment[];
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
}

const AgendaView: React.FC<Props> = ({ appointments, setAppointments }) => {
  const [filter, setFilter] = useState('');
  
  const today = new Date().toISOString().split('T')[0];
  const filtered = appointments
    .filter(a => 
      a.customerName.toLowerCase().includes(filter.toLowerCase()) || 
      a.service.toLowerCase().includes(filter.toLowerCase())
    )
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  const toggleStatus = (id: string) => {
    setAppointments(prev => prev.map(a => 
      a.id === id ? { ...a, status: a.status === 'scheduled' ? 'completed' : 'scheduled' } : a
    ));
  };

  const removeAppointment = (id: string) => {
    if (confirm('Remover agendamento?')) {
      setAppointments(prev => prev.filter(a => a.id !== id));
    }
  };

  return (
    <div className="py-2 space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex gap-2">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-rose-300 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Quem você procura?"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl py-4 pl-12 pr-4 premium-shadow focus:ring-2 focus:ring-rose-500/20 transition-all text-sm font-semibold placeholder:text-white/20 text-white"
          />
        </div>
        <button className="p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl premium-shadow text-white/60 active:scale-90 transition-all">
          <Filter size={20} />
        </button>
      </div>

      <div className="space-y-4">
        {filtered.length > 0 ? filtered.map((apt) => (
          <div 
            key={apt.id} 
            className={`group bg-white/10 backdrop-blur-xl border border-white/20 rounded-[32px] p-6 premium-shadow transition-all duration-300 active:scale-[0.98] ${apt.status === 'completed' ? 'bg-emerald-500/10 border-emerald-500/30' : ''}`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg transition-colors ${apt.status === 'completed' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white/10 text-white/40 border border-white/10'}`}>
                  {apt.customerName[0]}
                </div>
                <div>
                  <h4 className={`font-extrabold text-white transition-all ${apt.status === 'completed' ? 'line-through opacity-40' : ''}`}>{apt.customerName}</h4>
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest flex items-center gap-1.5 mt-1">
                    <Clock size={12} /> {apt.time} • {apt.date === today ? 'Hoje' : apt.date}
                  </p>
                </div>
              </div>
              <p className="text-sm font-black text-white">{formatCurrency(apt.value)}</p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <span className="px-3 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">
                {apt.service}
              </span>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => removeAppointment(apt.id)}
                  className="p-2 text-white/10 hover:text-rose-400 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
                <button 
                  onClick={() => toggleStatus(apt.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[11px] font-bold uppercase tracking-wider transition-all border ${
                    apt.status === 'completed' 
                      ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/20' 
                      : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                  }`}
                >
                  {apt.status === 'completed' ? <CheckCircle2 size={14} /> : null}
                  {apt.status === 'completed' ? 'Feito' : 'Concluir'}
                </button>
              </div>
            </div>
          </div>
        )) : (
          <div className="py-24 text-center space-y-4">
            <div className="w-24 h-24 bg-white/5 backdrop-blur-md rounded-[40px] border border-white/10 flex items-center justify-center mx-auto text-white/10">
              <CalendarDays size={48} />
            </div>
            <p className="text-white/20 font-bold uppercase tracking-widest text-xs">Agenda Vazia</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgendaView;
