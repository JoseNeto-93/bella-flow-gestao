
import React from 'react';
import { Appointment } from '../types';
import { calculateBillingMetrics, formatCurrency } from '../services/dataService';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  CartesianGrid
} from 'recharts';
import { Wallet, ArrowUpRight } from 'lucide-react';

interface Props {
  appointments: Appointment[];
}

const BillingView: React.FC<Props> = ({ appointments }) => {
  const metrics = calculateBillingMetrics(appointments);
  const today = new Date().toISOString().split('T')[0];
  
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const chartData = last7Days.map(date => {
    const dayRevenue = appointments
      .filter(a => a.date === date && (a.status === 'completed' || (a.status === 'scheduled' && a.date <= today)))
      .reduce((sum, a) => sum + a.value, 0);
    
    return {
      name: new Date(date).toLocaleDateString('pt-BR', { weekday: 'short' }),
      value: dayRevenue,
      isToday: date === today
    };
  });

  return (
    <div className="py-2 space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-[32px] premium-shadow space-y-3">
          <div className="w-10 h-10 bg-rose-500/20 border border-rose-500/20 rounded-xl flex items-center justify-center text-rose-300">
            <Wallet size={20} />
          </div>
          <div>
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Total Líquido</p>
            <p className="text-xl font-black text-white mt-1">{formatCurrency(metrics.totalRevenue)}</p>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-[32px] premium-shadow space-y-3">
          <div className="w-10 h-10 bg-emerald-500/20 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
            <ArrowUpRight size={20} />
          </div>
          <div>
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Atendimentos</p>
            <p className="text-xl font-black text-white mt-1">{metrics.count}</p>
          </div>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-[40px] premium-shadow">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-lg font-extrabold text-white tracking-tight">Receita Semanal</h3>
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-rose-400"></div>
            <div className="w-2 h-2 rounded-full bg-white/10"></div>
          </div>
        </div>
        
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 10, fill: 'rgba(255,255,255,0.3)', fontWeight: 700}}
                dy={15}
              />
              <Tooltip 
                cursor={{fill: 'rgba(255,255,255,0.05)', radius: 12}}
                contentStyle={{background: 'rgba(24,24,27,0.8)', backdropFilter: 'blur(20px)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', padding: '12px 16px'}}
                itemStyle={{fontSize: '12px', fontWeight: '800', color: '#FFFFFF'}}
                labelStyle={{display: 'none'}}
                formatter={(val: number) => [formatCurrency(val), 'Receita']}
              />
              <Bar dataKey="value" radius={[10, 10, 10, 10]} barSize={32}>
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.isToday ? '#FB7185' : 'rgba(255,255,255,0.1)'} 
                    className="transition-all duration-500 hover:opacity-80"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <section className="space-y-4">
        <h3 className="text-lg font-extrabold text-white tracking-tight px-2">Top Performance</h3>
        <div className="space-y-3">
          {Object.entries(appointments.reduce((acc, curr) => {
            if (curr.status === 'completed' || (curr.status === 'scheduled' && curr.date <= today)) {
              acc[curr.service] = (acc[curr.service] || 0) + curr.value;
            }
            return acc;
          }, {} as Record<string, number>))
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([name, val], idx) => (
            <div key={name} className="flex items-center justify-between bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-[32px] premium-shadow group hover:border-rose-400/40 transition-colors">
              <div className="flex items-center gap-4">
                <span className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center text-[10px] font-black italic border border-white/10">
                  #{idx + 1}
                </span>
                <p className="font-extrabold text-white">{name}</p>
              </div>
              <p className="font-black text-rose-300">{formatCurrency(val)}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default BillingView;
