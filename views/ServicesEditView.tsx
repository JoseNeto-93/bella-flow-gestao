import React, { useState } from 'react';
import { Service } from '../types';
import { Plus, Trash2, Save, X } from 'lucide-react';

interface Props {
  services: Service[];
  onSave: (services: Service[]) => void;
  onClose: () => void;
}

const ServicesEditView: React.FC<Props> = ({ services, onSave, onClose }) => {
  const [editedServices, setEditedServices] = useState<Service[]>([...services]);

  const addService = () => {
    const newService: Service = {
      id: Date.now().toString(),
      name: 'Novo Serviço',
      price: 0,
      duration: 60,
    };
    setEditedServices([...editedServices, newService]);
  };

  const removeService = (id: string) => {
    setEditedServices(editedServices.filter(s => s.id !== id));
  };

  const updateService = (id: string, field: keyof Service, value: any) => {
    setEditedServices(editedServices.map(s =>
      s.id === id ? { ...s, [field]: value } : s
    ));
  };

  const handleSave = async () => {
    // Salvar no backend
    try {
      const apiKey = localStorage.getItem('apiKey');
      const phone = localStorage.getItem('phone');
      
      if (apiKey && phone) {
        const response = await fetch('/api/update-services', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phone,
            apiKey,
            services: editedServices,
          }),
        });
        
        if (response.ok) {
          onSave(editedServices);
          onClose();
        } else {
          alert('Erro ao salvar serviços. Tente novamente.');
        }
      }
    } catch (error) {
      console.error('Erro ao salvar serviços:', error);
      alert('Erro ao salvar serviços. Tente novamente.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#1a0b2e] rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-600 to-purple-600 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-black text-white">Editar Serviços</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <X size={24} className="text-white" />
          </button>
        </div>

        {/* Services List */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {editedServices.map((service) => (
            <div key={service.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={service.name}
                  onChange={e => updateService(service.id, 'name', e.target.value)}
                  className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white font-semibold outline-none focus:border-rose-400 transition-colors"
                  placeholder="Nome do serviço"
                />
                <button
                  onClick={() => removeService(service.id)}
                  className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-xl transition-colors"
                >
                  <Trash2 size={20} className="text-red-400" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/40 text-xs font-bold uppercase tracking-wider mb-1 block">
                    Preço (R$)
                  </label>
                  <input
                    type="number"
                    value={service.price}
                    onChange={e => updateService(service.id, 'price', parseFloat(e.target.value) || 0)}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white font-semibold outline-none focus:border-rose-400 transition-colors"
                    min="0"
                    step="10"
                  />
                </div>
                <div>
                  <label className="text-white/40 text-xs font-bold uppercase tracking-wider mb-1 block">
                    Duração (min)
                  </label>
                  <input
                    type="number"
                    value={service.duration}
                    onChange={e => updateService(service.id, 'duration', parseInt(e.target.value) || 60)}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white font-semibold outline-none focus:border-rose-400 transition-colors"
                    min="15"
                    step="15"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-white/10 flex gap-3">
          <button
            onClick={addService}
            className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl py-3 px-4 flex items-center justify-center gap-2 text-white font-bold transition-colors"
          >
            <Plus size={20} />
            Adicionar Serviço
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-700 hover:to-purple-700 rounded-2xl py-3 px-4 flex items-center justify-center gap-2 text-white font-bold transition-all shadow-lg"
          >
            <Save size={20} />
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServicesEditView;
