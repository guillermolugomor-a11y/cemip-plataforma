import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  ChevronRight, 
  Mail, 
  Award, 
  MoreVertical,
  Activity,
  UserCheck,
  Edit2,
  Trash2
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useSpecialistStore } from './SpecialistStore';
import type { Specialist } from './SpecialistStore';
import SpecialistModal from './SpecialistModal';

const AppleIcon = ({ icon: Icon, className = "w-5 h-5", strokeWidth = 1.5 }: any) => (
  <Icon className={className} strokeWidth={strokeWidth} />
);

const MetricMini = ({ label, value, colorClass }: any) => (
  <div className="flex-1 bg-apple-bg border border-apple-separator p-5 rounded-apple flex items-center justify-between transition-all hover:shadow-apple-soft">
    <div>
      <div className="description-small uppercase tracking-widest mb-1">{label}</div>
      <div className="text-xl font-bold text-apple-text tabular-nums">{value}</div>
    </div>
    <div className={cn("w-1.5 h-8 rounded-full", colorClass)} />
  </div>
);

export default function SpecialistsMain() {
  const { specialists, updateSpecialist, deleteSpecialist, fetchSpecialists, isLoading } = useSpecialistStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSpecialist, setSelectedSpecialist] = useState<Specialist | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchSpecialists();
  }, [fetchSpecialists]);

const filteredSpecialists = specialists.filter(s => 
    s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.specialty?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (s: Specialist) => {
    setSelectedSpecialist(s);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar a ${name}?`)) {
      deleteSpecialist(id);
    }
  };

  const handleNew = () => {
    setSelectedSpecialist(undefined);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-apple pb-20 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black tracking-widest uppercase text-apple-blue mb-0.5 block">Equipo Médico</span>
          <h2 className="text-xl font-bold tracking-tight text-apple-text">Directorio de Especialistas</h2>
        </div>
        <button
          onClick={handleNew}
          className="apple-button apple-button-primary flex items-center justify-center gap-2 px-6 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" strokeWidth={2} /> Nuevo Especialista
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-apple-text-tertiary w-4 h-4" strokeWidth={1.5} />
        <input
          type="text"
          placeholder="Buscar especialistas..."
          className="w-full bg-apple-bg border border-apple-separator rounded-2xl py-3 pl-11 pr-4 text-[13px] text-apple-text outline-none focus:ring-2 focus:ring-apple-blue/20 transition-all font-medium placeholder:text-apple-text-tertiary shadow-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Specialist cards */}
      {isLoading ? (
        <div className="flex items-center justify-center h-48 text-[13px] font-bold text-apple-text-tertiary">
          Cargando especialistas desde la base de datos...
        </div>
      ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredSpecialists.map((s) => (
          <div key={s.id} className="bg-apple-bg border border-apple-separator rounded-2xl p-5 hover:shadow-md transition-all group flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-apple-tertiary text-apple-blue flex items-center justify-center font-black text-[13px] uppercase group-hover:bg-apple-blue group-hover:text-white transition-colors">
                  {s.name.charAt(0)}
                </div>
                <div>
                  <div className="text-[13px] font-bold text-apple-text leading-tight">{s.name}</div>
                  <div className="text-[11px] font-medium text-apple-text-secondary flex items-center gap-1.5">
                    <Mail className="w-3 h-3" strokeWidth={1.5} /> {s.email}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => handleEdit(s)}
                  className="p-1.5 text-apple-text-tertiary hover:text-apple-blue transition-all rounded-lg hover:bg-apple-tertiary"
                  title="Editar"
                >
                  <Edit2 className="w-3.5 h-3.5" strokeWidth={2} />
                </button>
                <button 
                  onClick={() => handleDelete(s.id, s.name)}
                  className="p-1.5 text-apple-text-tertiary hover:text-apple-red transition-all rounded-lg hover:bg-apple-red/5"
                  title="Eliminar"
                >
                  <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-apple-separator/50 pt-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-apple-tertiary rounded-lg border border-apple-separator text-[10px] font-bold uppercase text-apple-text-secondary">
                <Award className="w-3.5 h-3.5 text-apple-blue" strokeWidth={1.5} /> {s.specialty}
              </div>
              <button
                onClick={() => updateSpecialist(s.id, { status: s.status === 'Activo' ? 'Inactivo' : 'Activo' })}
                className={cn(
                  "text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-lg transition-all border",
                  s.status === 'Activo'
                    ? "bg-apple-green/10 text-apple-green border-apple-green/20"
                    : "bg-apple-secondary text-apple-text-tertiary border-apple-separator/50"
                )}
              >
                {s.status}
              </button>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MetricMini label="Total Registrados" value={specialists.length} colorClass="bg-apple-blue" />
        <MetricMini label="Personal Activo" value={specialists.filter(s => s.status === 'Activo').length} colorClass="bg-apple-green" />
        <MetricMini label="Estado Red" value="Online" colorClass="bg-apple-green" />
        <div className="flex-1 bg-apple-black rounded-2xl flex items-center justify-center p-5 gap-3 shadow-md">
          <UserCheck className="text-apple-bg w-4 h-4" strokeWidth={2} />
          <span className="text-[11px] font-bold tracking-widest text-apple-bg uppercase leading-none">Sync Activa</span>
        </div>
      </div>

      <SpecialistModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        specialist={selectedSpecialist}
      />
    </div>
  );
}
