import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Users,
  LayoutDashboard,
  Calendar,
  Wallet,
  UserSquare2,
  FileSearch,
  Settings,
  LogOut,
  Search,
  Bell,
  ChevronRight,
  Activity,
  ClipboardList,
  Target,
  FileText,
  UserCircle,
  FileSignature,
  Clock,
  FileOutput,
  ShieldAlert,
  Menu,
  Check,
  School,
  Home,
  List,
  X as XIcon,
  Moon,
  Sun
} from 'lucide-react';
import { cn } from './lib/utils';

// Modules
import { useAuthStore } from './lib/AuthStore';
import Login from './modules/auth/Login';
import DashboardMain from './modules/dashboard/DashboardMain';
import Anamnesis from './modules/anamnesis/Anamnesis';
import InterventionPlan from './modules/intervention/InterventionPlan';
import PatientSummary from './modules/patients/PatientSummary';
import Timeline from './modules/timeline/Timeline';
import Documents from './modules/documents/Documents';
import PatientList from './modules/patients/PatientList';
import Agenda from './modules/agenda/Agenda';
import AccountingDashboard from './modules/accounting/AccountingDashboard';
import SpecialistsMain from './modules/specialists/SpecialistsMain';
import TeamGoalsMain from './modules/team-goals/TeamGoalsMain';
import Evaluations from './modules/evaluations/Evaluations';
import DevelopmentAreas from './modules/development/DevelopmentAreas';
import Reports from './modules/reports/Reports';
import Alerts from './modules/alerts/Alerts';
import SchoolFollowUp from './modules/school/SchoolFollowUp';
import AppointmentHistory from './modules/agenda/AppointmentHistory';
import { useAgendaStore } from './modules/agenda/AgendaStore';
import { usePatientStore } from './modules/patients/PatientStore';
import { useSpecialistStore } from './modules/specialists/SpecialistStore';
import { useClinicalStore } from './modules/clinical/ClinicalStore';
import { useTeamGoalStore } from './modules/team-goals/TeamGoalStore';
import type { Patient } from './types/clinical';
import { getLocalDateString, getDayNameES } from './lib/dateUtils';

import { Toaster } from 'sonner';

const AppleIcon = ({ icon: Icon, className = "w-5 h-5", strokeWidth = 1.5 }: { icon: any; className?: string; strokeWidth?: number }) => {
  if (!Icon) return null;
  return <Icon className={className} strokeWidth={strokeWidth} />;
};

export default function App() {
  const [activeItem, setActiveItem] = useState('Dashboard');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [subModule, setSubModule] = useState('resumen');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const [darkMode, setDarkMode] = useState(() => {
    try {
      const stored = localStorage.getItem('cemip_theme');
      if (stored) return stored === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    localStorage.setItem('cemip_theme', darkMode ? 'dark' : 'light');
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Close notifications on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const { user, profile, initialize, isLoading: isAuthLoading, signOut } = useAuthStore();
  const { patients, fetchPatients, addPatient, updatePatient, deletePatient } = usePatientStore();
  const { appointments, fetchAppointments } = useAgendaStore();
  const { fetchClinicalData } = useClinicalStore();
  const { fetchSpecialists } = useSpecialistStore();
  const { teamGoals, fetchTeamGoals } = useTeamGoalStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (user) {
      fetchPatients();
      fetchAppointments();
      fetchClinicalData();
      fetchSpecialists();
      fetchTeamGoals();
    }
  }, [user, fetchPatients, fetchAppointments, fetchClinicalData, fetchSpecialists, fetchTeamGoals]);

  const [dismissedNotifications, setDismissedNotifications] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('cemip_dismissed_notifications');
      if (!stored || stored === 'null' || stored === 'undefined') return [];
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('cemip_dismissed_notifications', JSON.stringify(dismissedNotifications));
  }, [dismissedNotifications]);

  // SEO Update
  useEffect(() => {
    const pageTitle = activeItem === 'Pacientes' && selectedPatient
      ? `${selectedPatient.name} • CEMIP`
      : `${activeItem} • CEMIP Clinique`;
    document.title = pageTitle;
  }, [activeItem, selectedPatient]);

  const handleDismissNotification = (id: string) => {
    setDismissedNotifications(prev => [...(prev || []), id]);
  };

  // Appointments are already fetched above in the first useEffect

  const notifications = useMemo(() => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const todayDayName = getDayNameES(today);
    const tomorrowDayName = getDayNameES(tomorrow);
    const todayStr = getLocalDateString(today);
    const tomorrowStr = getLocalDateString(tomorrow);

    const alerts: { id: string; type: string; priority: string; title: string; message: string; patientId: string }[] = [];
    if (!patients || !Array.isArray(patients)) return [];

    patients.forEach(patient => {
      const days = (patient.attendanceDays || []).map(d => d.toLowerCase());

      if (days.includes(tomorrowDayName.toLowerCase())) {
        const hasApt = (appointments || []).some(apt => apt.patientId === patient.id && apt.date === tomorrowStr);
        const notificationId = `${patient.id}-${tomorrowStr}`;
        if (!hasApt && !(dismissedNotifications || []).includes(notificationId)) {
          alerts.push({
            id: notificationId,
            type: 'schedule',
            priority: 'high',
            title: `Agendar a ${patient.name}`,
            message: `Tiene sesión programada para mañana ${tomorrowDayName}.`,
            patientId: patient.id
          });
        }
      }

      if (days.includes(todayDayName.toLowerCase())) {
        const hasApt = (appointments || []).some(apt => apt.patientId === patient.id && apt.date === todayStr);
        const notificationId = `${patient.id}-${todayStr}`;
        if (!hasApt && !(dismissedNotifications || []).includes(notificationId)) {
          alerts.push({
            id: notificationId,
            type: 'schedule',
            priority: 'high',
            title: `Pendiente Hoy: ${patient.name}`,
            message: `Debió asistir hoy ${todayDayName} pero no tiene cita agendada.`,
            patientId: patient.id
          });
        }
      }
    });

    // Team Goals Notifications
    if (teamGoals && Array.isArray(teamGoals)) {
      const pendingMyGoals = teamGoals.filter(g => 
        g.status === 'pending' && 
        (g.responsible === profile?.full_name || g.responsible === 'Equipo Directivo' || (!g.responsible && profile?.role === 'admin'))
      );

      pendingMyGoals.forEach(goal => {
        const notificationId = `goal-${goal.id}-${goal.progress}`;
        if (!(dismissedNotifications || []).includes(notificationId)) {
          alerts.push({
            id: notificationId,
            type: 'goal',
            priority: goal.priority === 'high' ? 'high' : 'medium',
            title: `Iniciativa de Equipo: ${goal.title}`,
            message: goal.targetDate ? `Fecha límite: ${goal.targetDate}. Progreso: ${goal.progress}%` : `Tienes una iniciativa pendiente al ${goal.progress}%`,
            patientId: 'team'
          });
        }
      });
    }

    return alerts;
  }, [patients, appointments, dismissedNotifications, teamGoals, profile]);
  const handleAddPatient = async (newPatient: Patient) => {
    await addPatient(newPatient);
  };

  const handleUpdatePatient = async (updatedPatient: Patient) => {
    await updatePatient(updatedPatient.id, updatedPatient);
    if (selectedPatient?.id === updatedPatient.id) setSelectedPatient(updatedPatient);
  };

  const handleDeletePatient = async (id: string) => {
    if (window.confirm("¿Eliminar expediente? Se perderán los datos del paciente.")) {
      await deletePatient(id);
      if (selectedPatient?.id === id) setSelectedPatient(null);
    }
  };

  const filteredPatients = (patients || []).filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.caseId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const menuItems = [
    { id: 'Dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'Pacientes', icon: Users, label: 'Pacientes' },
    { id: 'Agenda', icon: Calendar, label: 'Agenda' },
    { id: 'Historial', icon: Clock, label: 'Historial' },
    { id: 'Contabilidad', icon: Wallet, label: 'Contabilidad', roles: ['admin', 'reception'] },
    { id: 'Especialistas', icon: UserSquare2, label: 'Especialistas', roles: ['admin'] },
    { id: 'MetasEquipo', icon: Target, label: 'Metas' },
  ].filter(item => !item.roles || (profile && item.roles.includes(profile.role)));

  const subModules = [
    { id: 'resumen', label: 'Resumen', icon: LayoutDashboard },
    { id: 'anamnesis', label: 'Anamnesis', icon: ClipboardList },
    { id: 'evaluaciones', label: 'Evaluaciones', icon: FileSignature },
    { id: 'intervencion', label: 'Plan Intervención', icon: Target },
    { id: 'desarrollo', label: 'Desarrollo', icon: Activity },
    { id: 'notas', label: 'Notas Evolución', icon: Clock },
    { id: 'reportes', label: 'Informes', icon: FileOutput },
    { id: 'seguimiento', label: 'Seguimiento Escolar', icon: School },
    { id: 'alertas', label: 'Alertas', icon: ShieldAlert },
    { id: 'documentos', label: 'Documentos', icon: FileText },
    { id: 'citas', label: 'Citas', icon: Calendar },
  ];

  const renderContent = () => {
    if (activeItem === 'Dashboard') return <DashboardMain patients={patients} onNavigate={setActiveItem} />;
    if (activeItem === 'Agenda') return <Agenda patients={patients} />;
    if (activeItem === 'Historial') return <AppointmentHistory />;
    if (activeItem === 'Contabilidad') return <AccountingDashboard />;
    if (activeItem === 'Especialistas') return <SpecialistsMain />;
    if (activeItem === 'MetasEquipo') return <TeamGoalsMain />;

    if (activeItem === 'Pacientes') {
      if (!selectedPatient) {
        return (
          <PatientList
            patients={patients}
            appointments={appointments}
            onPatientSelect={setSelectedPatient}
            onAddPatient={handleAddPatient}
            onUpdatePatient={handleUpdatePatient}
            onDeletePatient={handleDeletePatient}
          />
        );
      }

      switch (subModule) {
        case 'anamnesis': return <Anamnesis patientId={selectedPatient.id} />;
        case 'evaluaciones': return <Evaluations patientId={selectedPatient.id} />;
        case 'intervencion': return <InterventionPlan patientId={selectedPatient.id} />;
        case 'desarrollo': return <DevelopmentAreas patientId={selectedPatient.id} />;
        case 'notas': return <Timeline patientId={selectedPatient.id} />;
        case 'reportes': return <Reports patientId={selectedPatient.id} />;
        case 'seguimiento': return <SchoolFollowUp patient={selectedPatient} />;
        case 'alertas': return <Alerts patientId={selectedPatient.id} />;
        case 'documentos': return <Documents patientId={selectedPatient.id} />;
        case 'citas': return <AppointmentHistory patientId={selectedPatient.id} />;
        case 'resumen':
        default:
          return <PatientSummary patient={selectedPatient} />;
      }
    }

    return (
      <div className="h-full flex items-center justify-center opacity-20 italic font-medium">
        Módulo en construcción...
      </div>
    );
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-apple-slate flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-apple-black rounded-xl flex items-center justify-center animate-pulse">
            <Activity className="text-white w-6 h-6" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-apple-text-tertiary animate-pulse">Iniciando CEMIP...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="flex h-screen bg-apple-slate overflow-hidden font-sans text-apple-text selection:bg-apple-blue/10 selection:text-apple-blue">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={cn(
        "glass-effect !shadow-none flex flex-col z-40 border-r border-apple-separator/30 shrink-0 transition-transform duration-300 ease-in-out",
        "fixed inset-y-0 left-0 w-72",
        sidebarOpen ? "translate-x-0 !shadow-2xl" : "-translate-x-full",
        "lg:relative lg:translate-x-0 lg:w-64"
      )}>
        <div className="px-6 pt-8 pb-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center -ml-2">
              <img src="/logo.jpg" alt="CEMIP" className="h-24 w-auto object-contain mix-blend-multiply dark:mix-blend-normal" />
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 hover:bg-black/5 rounded-lg transition-colors text-apple-text-tertiary">
              <XIcon className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
          <div className="text-[10px] text-apple-text-tertiary tracking-widest font-black uppercase px-2 mb-2 opacity-50">Menú Principal</div>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveItem(item.id);
                if (item.id !== 'Pacientes') setSelectedPatient(null);
                setSidebarOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-apple transition-all duration-300 group text-[13px] font-bold",
                activeItem === item.id
                  ? "sidebar-item-active"
                  : "text-apple-text-secondary hover:bg-apple-bg/60 hover:text-apple-black"
              )}
            >
              <item.icon className={cn("w-4 h-4 transition-colors", activeItem === item.id ? "text-white" : "text-apple-text-tertiary group-hover:text-apple-black")} strokeWidth={2} />
              <span className="tracking-tight">{item.label}</span>
              {activeItem === item.id && <ChevronRight className="w-3 h-3 ml-auto opacity-70" />}
            </button>
          ))}

          {activeItem === 'Pacientes' && (
            <div className="mt-8 space-y-4 px-1 animate-apple">
              <div className="text-[10px] font-black tracking-widest text-apple-text-tertiary uppercase px-1 opacity-50">Expedientes Activos</div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-apple-text-tertiary w-3.5 h-3.5" strokeWidth={1.5} />
                <input
                  type="text"
                  placeholder="Buscar paciente..."
                  className="w-full bg-apple-bg/50 border border-apple-separator/50 rounded-xl py-2.5 pl-9 pr-4 text-[12px] text-apple-text outline-none focus:bg-apple-bg focus:ring-2 focus:ring-apple-blue/10 transition-all font-medium"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="space-y-1 max-h-[35vh] overflow-y-auto custom-scrollbar pr-1">
                {(filteredPatients || []).map((patient) => (
                  <button
                    key={patient.id}
                    onClick={() => {
                      setSelectedPatient(patient);
                      setSubModule('resumen');
                      setSidebarOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left group",
                      selectedPatient?.id === patient.id
                        ? "bg-apple-bg shadow-apple-medium ring-1 ring-apple-separator/20"
                        : "text-apple-text-secondary hover:bg-apple-bg/40 hover:text-apple-black"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-black uppercase shrink-0 transition-all",
                      selectedPatient?.id === patient.id ? "bg-apple-blue text-white" : "bg-apple-tertiary text-apple-text-tertiary"
                    )}>
                      {patient.name.charAt(0)}
                    </div>
                    <div className="overflow-hidden">
                      <div className="font-bold text-[13px] truncate whitespace-nowrap">{patient.name}</div>
                      <div className="text-[10px] font-bold text-apple-text-tertiary opacity-70">{patient.caseId}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </nav>

        <div className="p-6 mt-auto border-t border-apple-separator/30">
          <div className="flex items-center gap-3 px-2 py-3">
            <UserCircle className="w-8 h-8 text-apple-text-tertiary" />
            <div>
              <div className="text-apple-black font-bold text-[13px] truncate max-w-[120px]">{profile?.full_name || user?.email?.split('@')[0]}</div>
              <div className="text-[9px] text-apple-text-tertiary font-bold uppercase tracking-widest">{profile?.role || 'Especialista'}</div>
            </div>
            <button 
              onClick={() => signOut()}
              className="ml-auto p-2 text-apple-text-tertiary hover:text-apple-red transition-colors"
              title="Cerrar Sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative bg-apple-slate min-w-0">
        {/* Header - Restyled for Mobile Screenshot - Hidden on Patients Mobile */}
        <header className={cn(
          "h-[72px] bg-apple-bg/70 backdrop-blur-xl border-b border-apple-separator/30 px-4 sm:px-10 flex items-center justify-between z-10 shrink-0",
          activeItem === 'Pacientes' && !selectedPatient && "lg:flex hidden"
        )}>
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-apple-text-secondary">
              <Menu className="w-6 h-6" strokeWidth={2} />
            </button>
            <div className="flex items-center gap-2">
              <img src="/logo.jpg" alt="CEMIP" className="h-14 w-auto object-contain mix-blend-multiply dark:mix-blend-normal" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 text-apple-text-secondary hover:bg-apple-slate rounded-full transition-colors"
              title="Alternar tema oscuro"
            >
              {darkMode ? <Sun className="w-5 h-5" strokeWidth={2} /> : <Moon className="w-5 h-5" strokeWidth={2} />}
            </button>
            <div className="relative hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-apple-text-tertiary w-3.5 h-3.5" />
              <input type="text" placeholder="Búsqueda global..." className="w-64 bg-apple-slate border border-apple-separator/30 rounded-2xl py-2.5 pl-11 pr-4 text-[13px] outline-none placeholder:text-apple-text-tertiary/60 focus:bg-apple-bg transition-all" />
            </div>

            {/* Bell Notifications */}
            <div className="relative" ref={notificationsRef}>
              <button
                className="p-2 relative group"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell className="w-6 h-6 text-apple-text-secondary" strokeWidth={2} />
                {notifications.length > 0 && (
                  <div className="absolute top-2 right-2 w-2 h-2 bg-apple-red rounded-full ring-2 ring-white" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-apple-bg/95 backdrop-blur-xl border border-apple-separator/30 rounded-2xl shadow-apple-huge z-[100] animate-apple overflow-hidden">
                  <div className="px-5 py-4 border-b border-apple-separator/20 bg-apple-slate/30 flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-apple-black">Notificaciones</span>
                    <span className="px-2 py-0.5 bg-apple-blue text-white rounded text-[9px] font-bold">{notifications.length}</span>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="p-10 text-center text-apple-text-tertiary">
                        <Bell className="w-8 h-8 opacity-20 mx-auto mb-3" />
                        <p className="text-[11px] font-bold uppercase tracking-widest">Sin alertas</p>
                      </div>
                    ) : (
                      notifications.map((n, i) => (
                        <div key={i} className="p-4 border-b border-apple-separator/10 hover:bg-apple-slate/40 transition-colors group cursor-pointer relative">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDismissNotification(n.id); }}
                            className="absolute top-4 right-4 p-1 rounded bg-apple-slate border opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Check className="w-3 h-3 text-apple-green" />
                          </button>
                          <div className="flex gap-3">
                            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", n.priority === 'high' ? 'bg-apple-red/10 text-apple-red' : 'bg-apple-blue/10 text-apple-blue')}>
                              {n.type === 'schedule' ? <Calendar className="w-4 h-4" /> : n.type === 'goal' ? <Target className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                            </div>
                            <div>
                              <p className="text-[13px] font-bold text-apple-black pr-8 leading-snug">{n.title}</p>
                              <p className="text-[11px] font-medium text-apple-text-tertiary mt-1">{n.message}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {selectedPatient && activeItem === 'Pacientes' && (
          <div className="px-4 sm:px-10 h-14 flex gap-2 bg-apple-bg/70 backdrop-blur-xl border-b border-apple-separator/20 sticky top-0 z-20 overflow-x-auto no-scrollbar items-center shrink-0">
            {subModules.map((item) => (
              <button
                key={item.id}
                onClick={() => setSubModule(item.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-[11px] font-bold whitespace-nowrap border border-transparent",
                  subModule === item.id ? "bg-apple-black text-apple-bg" : "text-apple-text-secondary hover:bg-apple-slate"
                )}
              >
                <AppleIcon icon={item.icon} className="w-3.5 h-3.5" />
                {item.label}
              </button>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 sm:p-10 custom-scrollbar scroll-smooth">
          <div className="max-w-[1400px] mx-auto h-full animate-apple">
            {renderContent()}
          </div>
        </div>

        {/* Bottom Navigation (Mobile Only) */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-20 bg-apple-bg/90 backdrop-blur-xl border-t border-apple-separator/50 px-8 flex items-center justify-between shrink-0 z-40 pb-safe shadow-[0_-1px_10px_rgba(0,0,0,0.02)]">
          {[
            { id: 'Dashboard', icon: Home, label: 'INICIO' },
            { id: 'Pacientes', icon: Users, label: 'PACIENTES' },
            { id: 'Agenda', icon: Calendar, label: 'CITAS' },
            { id: 'Ajustes', icon: Settings, label: 'AJUSTES' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveItem(item.id === 'Ajustes' ? 'Especialistas' : item.id);
                if (item.id !== 'Pacientes') setSelectedPatient(null);
              }}
              className={cn(
                "flex flex-col items-center gap-1.5 transition-all duration-300",
                (activeItem === item.id || (item.id === 'Ajustes' && activeItem === 'Especialistas')) ? "text-apple-blue" : "text-apple-text-tertiary"
              )}
            >
              <item.icon 
                className="w-6 h-6" 
                strokeWidth={2} 
              />
              <span className="text-[10px] font-bold tracking-[0.05em] uppercase">{item.label}</span>
            </button>
          ))}
        </nav>
      </main>
      <Toaster position="top-right" expand={true} richColors />
    </div>
  );
}
