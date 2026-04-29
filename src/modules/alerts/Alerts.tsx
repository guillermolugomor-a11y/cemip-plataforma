import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Flag, 
  CalendarClock, 
  FileSignature, 
  ShieldAlert, 
  ChevronRight,
  UserX,
  Target,
  CheckCircle2
} from 'lucide-react';
import { cn } from '../../lib/utils';

const AlertCard = ({ title, description, level, icon: Icon, time }: any) => {
  const isCritical = level === 'critical';
  return (
    <div className={cn(
      "border rounded-xl p-5 flex items-start gap-4 transition-all relative overflow-hidden",
      isCritical 
        ? "bg-apple-red/5 border-apple-red/20 shadow-sm" 
        : "bg-apple-orange/5 border-apple-orange/20"
    )}>
       <div className={cn(
         "w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 bg-apple-bg",
         isCritical ? "text-apple-red border-apple-red/30 shadow-sm shadow-apple-red/10" : "text-apple-orange border-apple-orange/30 shadow-sm shadow-apple-orange/10"
       )}>
         <Icon className="w-5 h-5" strokeWidth={isCritical ? 2 : 1.5} />
       </div>
       <div className="flex-1">
          <div className="flex items-center justify-between mb-0.5">
            <h4 className={cn("font-bold text-[14px]", isCritical ? "text-apple-red" : "text-apple-orange")}>{title}</h4>
            <span className={cn("text-[10px] font-bold tracking-widest uppercase", isCritical ? "text-apple-red/60" : "text-apple-orange/60")}>{time}</span>
          </div>
          <p className="text-[12px] font-medium text-apple-text-secondary leading-relaxed">
            {description}
          </p>
       </div>
    </div>
  );
};

export default function Alerts({ patientId }: { patientId?: string }) {
  const [alerts] = useState([
    { id: 1, title: 'Inasistencia Recurrente', description: 'El paciente ha faltado a sus 2 últimas sesiones programadas en agenda.', level: 'critical', icon: UserX, time: 'Hace 3 días' },
    { id: 2, title: 'Estancamiento Clínico', description: 'El objetivo "Mantener contacto visual" no ha reportado avances en las últimas 4 sesiones clínicas.', level: 'warning', icon: Target, time: 'Hace 1 semana' },
    { id: 3, title: 'Re-evaluación Pendiente', description: 'Han transcurrido 6 meses desde la aplicación del ADOS-2. Se sugiere programar seguimiento.', level: 'warning', icon: CalendarClock, time: 'Hoy' },
  ]);

  return (
    <div className="space-y-10 animate-apple pb-20 max-w-5xl mx-auto">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-apple-text mb-0.5">Motor de Reglas y Alertas</h2>
          <p className="description-small font-bold text-apple-text-secondary uppercase tracking-widest">Auditoría Clínica Automática</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         
         {/* Red Flags / Alerts System */}
         <div className="bg-apple-bg border border-apple-separator rounded-apple p-8 shadow-sm flex flex-col">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-apple-red/10 rounded-xl flex items-center justify-center text-apple-red shrink-0 shadow-sm border border-apple-red/20">
                 <ShieldAlert className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-[16px] font-bold tracking-tight text-apple-text leading-none mb-1">Banderas Rojas</h3>
                <div className="text-[10px] font-bold tracking-widest text-apple-red uppercase">Reglas de negocio activas</div>
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-4">
              {alerts.length === 0 ? (
                 <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-apple-tertiary border border-dashed border-apple-separator rounded-2xl">
                    <Flag className="w-8 h-8 text-apple-green/50 mb-3" />
                    <p className="text-[13px] font-medium text-apple-text-secondary">No hay banderas rojas generadas por el sistema. El proceso clínico está al día.</p>
                 </div>
              ) : (
                alerts.map(al => (
                  <AlertCard key={al.id} {...al} />
                ))
              )}
            </div>
         </div>

         {/* Digital Consents */}
         <div className="bg-apple-secondary border border-apple-separator rounded-apple p-8 flex flex-col relative overflow-hidden shadow-sm group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-apple-blue/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none transition-all group-hover:scale-110" />
            
            <div className="flex items-center gap-3 mb-8 relative z-10">
              <div className="w-10 h-10 bg-apple-bg rounded-xl flex items-center justify-center text-apple-blue shrink-0 shadow-sm border border-apple-separator">
                 <FileSignature className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-[16px] font-bold tracking-tight text-apple-text leading-none mb-1">Consentimientos Firmados</h3>
                <div className="text-[10px] font-bold tracking-widest text-apple-blue uppercase">Marco Legal (Digital)</div>
              </div>
            </div>

            <div className="space-y-4 relative z-10">
               <div className="bg-apple-bg border text-left border-apple-separator rounded-xl p-5 hover:border-apple-blue/40 transition-colors shadow-sm cursor-pointer group/card flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="w-8 h-8 bg-apple-green/10 text-apple-green rounded-full flex items-center justify-center border border-apple-green/20">
                       <CheckCircle2 className="w-4 h-4" />
                     </div>
                     <div>
                       <div className="text-[13px] font-bold text-apple-text">Acuerdo de Ingreso Clínico</div>
                       <div className="text-[10px] font-bold tracking-widest text-apple-text-secondary uppercase mt-0.5">Firmado: 15 Ene 2026</div>
                     </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-apple-text-tertiary group-hover/card:text-apple-blue transition-colors" />
               </div>

               <div className="bg-apple-bg border text-left border-apple-separator rounded-xl p-5 hover:border-apple-blue/40 transition-colors shadow-sm cursor-pointer group/card flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="w-8 h-8 bg-apple-green/10 text-apple-green rounded-full flex items-center justify-center border border-apple-green/20">
                       <CheckCircle2 className="w-4 h-4" />
                     </div>
                     <div>
                       <div className="text-[13px] font-bold text-apple-text">Aviso de Privacidad (Datos)</div>
                       <div className="text-[10px] font-bold tracking-widest text-apple-text-secondary uppercase mt-0.5">Firmado: 15 Ene 2026</div>
                     </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-apple-text-tertiary group-hover/card:text-apple-blue transition-colors" />
               </div>

               <div className="bg-apple-red/5 border text-left border-apple-red/20 rounded-xl p-5 hover:border-apple-red transition-colors shadow-sm cursor-pointer group/card flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="w-8 h-8 bg-apple-bg text-apple-red rounded-full flex items-center justify-center border border-apple-red/20 shadow-sm shadow-apple-red/10">
                       <AlertTriangle className="w-4 h-4" />
                     </div>
                     <div>
                       <div className="text-[13px] font-bold text-apple-red">Consentimiento de Grabación</div>
                       <div className="text-[10px] font-bold tracking-widest text-apple-red/60 uppercase mt-0.5">Falta Firma de la Madre</div>
                     </div>
                  </div>
                  <button className="text-[10px] font-bold text-white bg-apple-red px-4 py-2 rounded-lg shadow-sm uppercase tracking-widest hover:bg-red-600 transition-colors">
                    Solicitar
                  </button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
