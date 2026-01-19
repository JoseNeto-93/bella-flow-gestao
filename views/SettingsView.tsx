import React, { useState } from 'react';
import { SalonConfig } from '../types';
import { Scissors, Clock, Phone, MapPin, ChevronRight, LogOut, ShieldCheck, CreditCard } from 'lucide-react';
import ServicesEditView from './ServicesEditView';

interface Props {
  config: SalonConfig;
  setConfig: React.Dispatch<React.SetStateAction<SalonConfig>>;
  onServicesUpdate?: (services: any[]) => void;
}

const SettingsView: React.FC<Props> = ({ config, setConfig, onServicesUpdate }) => {
  const [showServicesEdit, setShowServicesEdit] = useState(false);

  const handleSaveServices = (updatedServices: any[]) => {
    setConfig({ ...config, services: updatedServices });
    if (onServicesUpdate) {
      onServicesUpdate(updatedServices);
    }
  };

  return (
    <>
      <div className="py-2 space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex flex-col items-center text-center space-y-6 pt-6">
        <div className="relative">
          <div className="w-28 h-28 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[40px] premium-shadow flex items-center justify-center text-rose-300">
            <Scissors size={44} />
          </div>
          <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 rounded-2xl border-4 border-[#581c87] flex items-center justify-center text-white">
            <ShieldCheck size={20} />
          </div>
        </div>
        
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-white tracking-tight">{config.name}</h2>
          <p className="text-white/40 text-xs font-bold uppercase tracking-[0.2em]">Painel Administrativo</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] px-6">Negócio</h3>
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[40px] overflow-hidden premium-shadow">
            <MenuLink 
              icon={<Scissors className="text-rose-300" size={20} />} 
              label="Catálogo de Serviços" 
              value={`${config.services.length} itens`}
              onClick={() => setShowServicesEdit(true)}
            />
            <MenuLink icon={<Clock className="text-white/80" size={20} />} label="Jornada de Trabalho" value={`${config.openingHours.start} - ${config.openingHours.end}`} />
            <MenuLink icon={<MapPin className="text-white/20" size={20} />} label="Localização" value="Configurado" />
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] px-6">Assinatura</h3>
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[40px] overflow-hidden premium-shadow">
            <MenuLink icon={<CreditCard className="text-rose-300" size={20} />} label="Plano Bella Pro" value="Anual" />
            <MenuLink icon={<Phone className="text-emerald-400" size={20} />} label="Integração WhatsApp" value="Ativo" />
          </div>
        </div>

        <button className="w-full flex items-center justify-center gap-2 p-6 text-white/20 font-bold uppercase tracking-widest text-[10px] hover:text-rose-400 transition-colors">
          <LogOut size={16} /> Encerrar Sessão
        </button>
      </div>

      <div className="text-center">
        <span className="bg-white/5 backdrop-blur-md text-white/30 text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border border-white/10">
          Bella Flow v1.2.5
        </span>
      </div>
    </div>

    {showServicesEdit && (
      <ServicesEditView
        services={config.services}
        onSave={handleSaveServices}
        onClose={() => setShowServicesEdit(false)}
      />
    )}
  </>
  );
};

const MenuLink: React.FC<{ icon: React.ReactNode; label: string; value?: string; onClick?: () => void }> = ({ icon, label, value, onClick }) => (
  <button onClick={onClick} className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-all border-b border-white/5 last:border-b-0 group">
    <div className="flex items-center gap-4">
      <div className="w-11 h-11 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors border border-white/5">
        {icon}
      </div>
      <span className="font-extrabold text-white text-sm tracking-tight">{label}</span>
    </div>
    <div className="flex items-center gap-3">
      {value && <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">{value}</span>}
      <ChevronRight size={16} className="text-white/10 group-hover:text-rose-300 transition-all group-hover:translate-x-1" />
    </div>
  </button>
);

export default SettingsView;
