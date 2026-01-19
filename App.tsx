import React, { useState, useEffect } from 'react';
import {
  LayoutGrid,
  CalendarDays,
  BarChart3,
  UserCircle2,
  MessageCircle,
  LogOut,
} from 'lucide-react';

import { SalonConfig, Appointment } from './types';
import chatApi from './services/chatApi';
import { DEFAULT_SERVICES } from './constants';

// Views
import HomeView from './views/HomeView';
import AgendaView from './views/AgendaView';
import BillingView from './views/BillingView';
import SettingsView from './views/SettingsView';
import { DashboardView } from './views/DashboardView';
import SimulatorModal from './components/SimulatorModal';
import SignupModal from './components/SignupModal';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'home' | 'agenda' | 'billing' | 'settings' | 'dashboard'
  >('home');

  const [salonConfig, setSalonConfig] = useState<SalonConfig>({
    name: 'Bella Flow',
    services: DEFAULT_SERVICES,
    openingHours: { start: '08:00', end: '19:00' },
  });

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);

  // Carregar dados do salão ao iniciar
  useEffect(() => {
    const loadSalonData = async () => {
      const apiKey = localStorage.getItem('apiKey');
      const phone = localStorage.getItem('phone');
      
      if (apiKey && phone) {
        setIsLoggedIn(true);
        try {
          // Buscar dados do dashboard
          const response = await fetch('/api/dashboard', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'x-phone': phone,
              'x-apikey': apiKey,
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.config) {
              setSalonConfig({
                name: data.salon?.name || 'Bella Flow',
                services: data.config.services || DEFAULT_SERVICES,
                openingHours: data.config.openingHours || { start: '08:00', end: '19:00' },
              });
            }
            // Carregar agendamentos do backend
            if (data.config?.appointments) {
              setAppointments(data.config.appointments);
            }
          }
        } catch (error) {
          console.error('Erro ao carregar dados do salão:', error);
        }
      }
    };
    
    loadSalonData();
  }, []);

  // Handler que delega para o backend
  const handleProcessMessage = async (msg: string) => {
    const phone = localStorage.getItem('phone') || 'web-client';
    const res = await chatApi.sendMessage(phone, msg);
    return res?.reply || '❌ Sem resposta';
  };

  // Recarregar agendamentos do backend
  const reloadAppointments = async () => {
    const apiKey = localStorage.getItem('apiKey');
    const phone = localStorage.getItem('phone');
    
    if (apiKey && phone) {
      try {
        const response = await fetch('/api/dashboard', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-phone': phone,
            'x-apikey': apiKey,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.config?.appointments) {
            setAppointments(data.config.appointments);
          }
        }
      } catch (error) {
        console.error('Erro ao recarregar agendamentos:', error);
      }
    }
  };

  // Atualizar serviços
  const handleUpdateServices = (services: any[]) => {
    setSalonConfig(prev => ({ ...prev, services }));
  };

  // Adicionar agendamento
  const handleAddAppointment = (appointment: Appointment) => {
    setAppointments(prev => [...prev, appointment]);
  };

  const renderView = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeView
            appointments={appointments}
            config={salonConfig}
            onNavigateToAgenda={() => setActiveTab('agenda')}
          />
        );

      case 'agenda':
        return (
          <AgendaView
            appointments={appointments}
            setAppointments={setAppointments}
          />
        );

      case 'billing':
        return <BillingView appointments={appointments} />;

      case 'settings':
        return (
          <SettingsView
            config={salonConfig}
            setConfig={setSalonConfig}
            onServicesUpdate={handleUpdateServices}
          />
        );

      case 'dashboard':
        return <DashboardView />;

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-transparent overflow-hidden relative">
      {/* HEADER */}
      <header className="px-6 pt-12 pb-6 bg-white/5 backdrop-blur-xl sticky top-0 z-40 border-b border-white/10">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-extrabold text-white">
              BELLA FLOW
            </h1>
            <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest">
              Inteligência Ativa
            </p>
          </div>

          <div className="flex gap-2 items-center">
            <button
              onClick={async () => {
                const phone = localStorage.getItem('phone');
                const apiKey = localStorage.getItem('apiKey');
                
                if (phone && apiKey) {
                  try {
                    const res = await fetch('/api/dashboard', {
                      method: 'GET',
                      headers: {
                        'Content-Type': 'application/json',
                        'x-phone': phone,
                        'x-apikey': apiKey,
                      },
                    });
                    const data = await res.json();
                    
                    const msg = `🔍 DEBUG: ${data.config?.appointments?.length || 0} agendamentos`;
                    alert(msg);
                  } catch (error) {
                    console.error('❌ Erro:', error);
                    alert('❌ ERRO: ' + error);
                  }
                } else {
                  alert('❌ Não logado');
                }
              }}
              className="px-2 py-1 bg-blue-600 rounded-lg text-white text-xs font-bold"
            >
              DEBUG
            </button>
            <button
              onClick={() => setIsSimulatorOpen(true)}
              className="p-3 bg-white/10 rounded-2xl text-white border border-white/20"
            >
              <MessageCircle size={22} />
            </button>
            <button
              onClick={() => setIsSignupOpen(true)}
              className="p-3 bg-emerald-600 rounded-2xl text-white border border-white/20"
            >
              Cadastrar
            </button>
          </div>
        </div>
      </header>

      {/* VIEW */}
      <main className="flex-1 overflow-y-auto pb-32 px-6">
        {renderView()}
      </main>

      {/* NAVBAR */}
      <div className="fixed bottom-6 left-0 right-0 px-6 z-50">
        <nav className="max-w-md mx-auto rounded-[32px] p-2 flex justify-between bg-white/10 backdrop-blur-xl">
          <NavButton
            active={activeTab === 'home'}
            onClick={() => setActiveTab('home')}
            icon={<LayoutGrid size={22} />}
          />
          <NavButton
            active={activeTab === 'agenda'}
            onClick={() => setActiveTab('agenda')}
            icon={<CalendarDays size={22} />}
          />
          <NavButton
            active={activeTab === 'billing'}
            onClick={() => setActiveTab('billing')}
            icon={<BarChart3 size={22} />}
          />
          <NavButton
            active={activeTab === 'settings'}
            onClick={() => setActiveTab('settings')}
            icon={<UserCircle2 size={22} />}
          />
          <NavButton
            active={activeTab === 'dashboard'}
            onClick={() => setActiveTab('dashboard')}
            icon={<LogOut size={22} />}
          />
        </nav>
      </div>

      {/* SIMULADOR */}
      {isSimulatorOpen && (
        <SimulatorModal
          onClose={() => {
            setIsSimulatorOpen(false);
            reloadAppointments(); // Recarregar agendamentos após fechar
          }}
          onSendMessage={handleProcessMessage}
        />
      )}

      {isSignupOpen && <SignupModal onClose={() => setIsSignupOpen(false)} />}
    </div>
  );
};

const NavButton: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}> = ({ active, onClick, icon }) => (
  <button
    onClick={onClick}
    className={`flex-1 flex justify-center py-3 rounded-2xl ${
      active ? 'bg-white/20 text-white' : 'text-white/50'
    }`}
  >
    {icon}
  </button>
);

export default App;
