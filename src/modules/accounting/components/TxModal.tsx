import React, { useState, useEffect } from 'react';
import {
    X, ArrowUpRight, ArrowDownRight, CheckCircle2, Calendar,
    History, User, Loader2, Upload, FileText, Trash2
} from 'lucide-react';
import { cn, openReceiptInNewTab } from '../../../lib/utils';
import { getLocalDateString } from '../../../lib/dateUtils';
import { useAccountingStore } from '../AccountingStore';
import { useSpecialistStore } from '../../specialists/SpecialistStore';
import { useAgendaStore } from '../../agenda/AgendaStore';
import { usePatientStore } from '../../patients/PatientStore';
import { fmt } from './AccountingUI';

const CATEGORIES_INCOME = ['Consulta', 'Evaluación', 'Terapia', 'Asesoría', 'Otro'];
const CATEGORIES_EXPENSE = ['Honorarios', 'Nómina', 'Renta', 'Suministros', 'Servicios', 'Otro'];

interface TxModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const TxModal = ({ isOpen, onClose }: TxModalProps) => {
    const { addTransaction } = useAccountingStore();
    const specialists = useSpecialistStore(s => s.specialists);
    const { appointments, markAppointmentsAsSpecialistPaid, fetchAppointments } = useAgendaStore();
    const patients = usePatientStore(s => s.patients);
    const fetchPatients = usePatientStore(s => s.fetchPatients);

    const [form, setForm] = useState({
        type: 'income' as 'income' | 'expense',
        concept: '', amount: '', method: 'Efectivo' as any,
        category: '', patientName: '', specialistName: '', nota: '',
        date: new Date().toISOString().split('T')[0],
    });

    const [selectedSpecialistId, setSelectedSpecialistId] = useState('');
    const [selectedAptIds, setSelectedAptIds] = useState<string[]>([]);
    const [selectedTodayAptId, setSelectedTodayAptId] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [receiptBase64, setReceiptBase64] = useState<string>('');

    // Force refresh data on mount
    useEffect(() => {
        if (isOpen) {
            fetchAppointments();
            fetchPatients();
        }
    }, [isOpen, fetchAppointments, fetchPatients]);

    const today = getLocalDateString();
    const todayApts = appointments.filter(a => a.date === today);

    // Resolve names for appointments
    const resolvedAppointments = React.useMemo(() => {
        return appointments.map(apt => {
            const p = patients.find(pat => pat.id === apt.patientId);
            const s = specialists.find(spec => spec.id === apt.specialistId);
            return {
                ...apt,
                patientName: p?.name || apt.patientName || 'Paciente',
                specialistName: s?.name || apt.specialistName || 'Especialista'
            };
        });
    }, [appointments, patients, specialists]);

    const pendingApts = resolvedAppointments.filter(a => {
        const specialist = specialists.find(s => s.id === selectedSpecialistId);
        if (!specialist) return false;
        
        const matchesId = a.specialistId && selectedSpecialistId && a.specialistId === selectedSpecialistId;
        const matchesName = a.specialistName && specialist && a.specialistName.toLowerCase().trim() === specialist.name.toLowerCase().trim();
        
        const isCollectedFromPatient = a.isPaid || a.isAccountingLogged;
        const isNotYetPaidToSpecialist = !a.isSpecialistPaid;
        
        return (matchesId || matchesName) && isCollectedFromPatient && isNotYetPaidToSpecialist;
    });

    // Debug info for UI
    const debugInfo = React.useMemo(() => {
        if (!selectedSpecialistId) return null;
        const spec = specialists.find(s => s.id === selectedSpecialistId);
        const allForSpec = resolvedAppointments.filter(a => 
            a.specialistId === selectedSpecialistId || 
            (spec && a.specialistName.toLowerCase().trim() === spec.name.toLowerCase().trim())
        );
        return {
            name: spec?.name,
            total: allForSpec.length,
            collected: allForSpec.filter(a => a.isPaid || a.isAccountingLogged).length,
            alreadyPaid: allForSpec.filter(a => a.isSpecialistPaid).length,
            pending: allForSpec.filter(a => (a.isPaid || a.isAccountingLogged) && !a.isSpecialistPaid).length
        };
    }, [selectedSpecialistId, resolvedAppointments, specialists]);

    const isNomina = form.type === 'expense' && form.category === 'Nómina';

    useEffect(() => {
        if (!isNomina || !selectedSpecialistId) return;
        const specialist = specialists.find(s => s.id === selectedSpecialistId);
        if (!specialist) return;

        const selApts = pendingApts.filter(a => selectedAptIds.includes(a.id));
        let total = 0;
        selApts.forEach(apt => {
            const cost = (apt as any).sessionCost || 500;
            if (specialist.paymentSchema === 'Porcentaje') {
                total += cost * ((specialist.paymentValue ?? 60) / 100);
            } else {
                total += specialist.paymentValue ?? cost;
            }
        });

        const patientNames = selApts.map(a => a.patientName || 'Paciente').join(', ');

        setForm(f => ({
            ...f,
            amount: total > 0 ? total.toString() : '',
            concept: selApts.length > 0
                ? `Honorarios ${specialist.name} – ${selApts.length} sesiones (${patientNames})`
                : f.concept,
            specialistName: specialist.name,
        }));
    }, [selectedAptIds, selectedSpecialistId, isNomina]);

    const resetForm = () => {
        setForm({
            type: 'income', concept: '', amount: '', method: 'Efectivo',
            category: '', patientName: '', specialistName: '', nota: '',
            date: new Date().toISOString().split('T')[0]
        });
        setSelectedSpecialistId('');
        setSelectedAptIds([]);
        setSelectedTodayAptId('');
        setReceiptFile(null);
        setReceiptBase64('');
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setReceiptFile(file);
            
            const reader = new FileReader();
            reader.onloadend = () => {
                setReceiptBase64(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSelectTodayApt = (aptId: string) => {
        setSelectedTodayAptId(aptId);
        if (!aptId) {
            setForm(f => ({ ...f, patientName: '', specialistName: '', concept: '', amount: '' }));
            return;
        }
        const apt = appointments.find(a => a.id === aptId);
        if (!apt) return;
        const specialist = specialists.find(s => s.id === apt?.specialistId);
        const cost = (apt as any).sessionCost;
        setForm(f => ({
            ...f,
            patientName: apt.patientName || '',
            specialistName: specialist?.name || (apt as any).specialistName || '',
            concept: `${apt.type || 'Consulta'} – ${apt.patientName}`,
            category: f.category || 'Consulta',
            amount: cost ? cost.toString() : f.amount,
        }));
    };

    const handleSave = async () => {
        if (!form.concept || !form.amount || isSaving) return;
        
        setIsSaving(true);
        
        try {
            await addTransaction({
                ...form,
                amount: parseFloat(form.amount),
                category: form.category || (form.type === 'income' ? 'Consulta' : 'Honorarios'),
                receiptUrl: receiptBase64 || undefined
            });
            if (isNomina && selectedAptIds.length > 0 && markAppointmentsAsSpecialistPaid) {
                await markAppointmentsAsSpecialistPaid(selectedAptIds);
            }
            onClose();
            resetForm();
        } catch (error) {
            console.error('Error saving transaction:', error);
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    const cats = form.type === 'income' ? CATEGORIES_INCOME : CATEGORIES_EXPENSE;
    const toggleApt = (id: string, checked: boolean) =>
        setSelectedAptIds(prev => checked ? [...prev, id] : prev.filter(x => x !== id));

    const canSave = form.concept && form.amount &&
        !(isNomina && selectedAptIds.length === 0);

    return (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-6 animate-apple">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-apple-bg w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl z-10 overflow-hidden border border-apple-separator">
                <div className="px-6 py-5 border-b border-apple-separator flex items-center justify-between bg-apple-secondary">
                    <div className="flex items-center gap-3">
                        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", form.type === 'income' ? 'bg-green-50 text-apple-green' : 'bg-red-50 text-apple-red')}>
                            {form.type === 'income' ? <ArrowUpRight className="w-5 h-5" strokeWidth={2} /> : <ArrowDownRight className="w-5 h-5" strokeWidth={2} />}
                        </div>
                        <div>
                            <h2 className="text-[16px] font-bold text-apple-text">Nuevo Movimiento</h2>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-apple-text-tertiary">Caja activa</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-apple-bg rounded-lg transition-colors text-apple-text-tertiary">
                        <X className="w-4 h-4" strokeWidth={2} />
                    </button>
                </div>

                <div className="p-6 space-y-4 overflow-y-auto max-h-[75vh] custom-scrollbar">
                    <div className="flex bg-apple-secondary rounded-xl p-1 gap-1">
                        {(['income', 'expense'] as const).map(t => (
                            <button
                                key={t}
                                onClick={() => { setForm(f => ({ ...f, type: t as 'income' | 'expense', category: '' })); setSelectedSpecialistId(''); setSelectedAptIds([]); setReceiptFile(null); setReceiptBase64(''); }}
                                className={cn(
                                    "flex-1 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all",
                                    form.type === t
                                        ? t === 'income' ? 'bg-apple-green text-white shadow' : 'bg-apple-red text-white shadow'
                                        : 'text-apple-text-secondary'
                                )}
                            >
                                {t === 'income' ? '+ Ingreso' : '− Egreso'}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-apple-text-tertiary">Fecha</label>
                        <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                            className="w-full bg-apple-secondary border border-apple-separator rounded-xl px-4 py-2 text-[14px] font-medium outline-none focus:border-apple-blue transition-all" />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-apple-text-tertiary">Categoría</label>
                        <div className="flex flex-wrap gap-2">
                            {cats.map(c => (
                                <button key={c}
                                    onClick={() => { setForm(f => ({ ...f, category: c, concept: '', amount: '' })); setSelectedSpecialistId(''); setSelectedAptIds([]); }}
                                    className={cn("px-3 py-1.5 rounded-lg border text-[11px] font-bold transition-all",
                                        form.category === c
                                            ? form.type === 'income' ? 'bg-apple-green text-white border-apple-green' : 'bg-apple-red text-white border-apple-red'
                                            : 'bg-apple-bg text-apple-text-secondary border-apple-separator hover:border-apple-text-secondary'
                                    )}>{c}</button>
                            ))}
                        </div>
                    </div>

                    {isNomina && (
                        <div className="space-y-4 p-4 bg-orange-50 border border-orange-100 rounded-xl animate-apple">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-2 h-2 bg-orange-400 rounded-full" />
                                <span className="text-[11px] font-bold text-orange-600 uppercase tracking-widest">Pago de Nómina</span>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-apple-text-tertiary">Especialista *</label>
                                <select
                                    value={selectedSpecialistId}
                                    onChange={e => { setSelectedSpecialistId(e.target.value); setSelectedAptIds([]); }}
                                    className="w-full bg-apple-bg border border-apple-separator rounded-xl px-4 py-2 text-[14px] font-medium outline-none focus:border-apple-blue transition-all appearance-none"
                                >
                                    <option value="">-- Seleccionar especialista --</option>
                                    {specialists.map(s => (
                                        <option key={s.id} value={s.id}>
                                            {s.name} ({s.paymentSchema === 'Porcentaje' ? `${s.paymentValue}%` : `$${s.paymentValue} fijo`})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {selectedSpecialistId && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-apple-text-tertiary">Sesiones adeudadas ({pendingApts.length})</label>
                                        {pendingApts.length > 0 && (
                                            <button
                                                onClick={() => setSelectedAptIds(pendingApts.map(a => a.id))}
                                                className="text-[10px] font-bold text-apple-blue hover:underline uppercase tracking-widest"
                                            >Sel. todas</button>
                                        )}
                                    </div>

                                    {pendingApts.length === 0 ? (
                                        <div className="rounded-xl bg-apple-bg border border-orange-100 p-4 text-center">
                                            <CheckCircle2 className="w-6 h-6 text-apple-green mx-auto mb-1" strokeWidth={1.5} />
                                            <p className="text-[12px] font-bold text-apple-text">Todo al día</p>
                                            <p className="text-[11px] text-apple-text-secondary mt-0.5">Sin sesiones pendientes de pago.</p>
                                        </div>
                                    ) : (
                                        <div className="max-h-44 overflow-y-auto rounded-xl border border-orange-100 bg-apple-bg custom-scrollbar">
                                            {pendingApts.map((apt, i) => (
                                                <label
                                                    key={apt.id}
                                                    className={cn(
                                                        "flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-orange-50 transition-colors",
                                                        i < pendingApts.length - 1 && "border-b border-orange-50"
                                                    )}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedAptIds.includes(apt.id)}
                                                        onChange={e => toggleApt(apt.id, e.target.checked)}
                                                        className="w-4 h-4 rounded accent-orange-500"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-[12px] font-bold text-apple-text truncate">{apt.patientName}</div>
                                                        <div className="text-[10px] text-apple-text-secondary">{apt.date} · {apt.type}</div>
                                                    </div>
                                                    <div className="text-[10px] font-bold text-orange-500 shrink-0">
                                                        {(() => {
                                                            const sp = specialists.find(s => s.id === selectedSpecialistId);
                                                            const cost = (apt as any).sessionCost || 500;
                                                            if (!sp) return '';
                                                            const pay = sp.paymentSchema === 'Porcentaje'
                                                                ? cost * ((sp.paymentValue ?? 60) / 100)
                                                                : (sp.paymentValue ?? cost);
                                                            return `$${pay.toLocaleString()}`;
                                                        })()}
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    )}

                                    {selectedAptIds.length > 0 && (
                                        <div className="flex items-center justify-between bg-apple-bg border border-orange-200 rounded-xl px-4 py-3">
                                            <span className="text-[11px] font-bold text-apple-text">{selectedAptIds.length} sesión{selectedAptIds.length > 1 ? 'es' : ''} seleccionada{selectedAptIds.length > 1 ? 's' : ''}</span>
                                            <span className="text-[14px] font-black text-orange-500 tabular-nums">
                                                {fmt(parseFloat(form.amount) || 0)}
                                            </span>
                                        </div>
                                    )}

                                    {/* Auditoría Debug (Solo visible para admin) */}
                                    {debugInfo && (
                                        <div className="mt-4 p-4 bg-white/50 rounded-xl border border-orange-200 animate-apple shadow-sm">
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse"></div>
                                                <div className="text-[9px] font-black uppercase tracking-[0.15em] text-orange-600">Auditoría: {debugInfo.name}</div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] font-bold text-apple-text-tertiary uppercase tracking-wider">Encontradas</span>
                                                    <span className="text-[12px] font-black text-apple-black tabular-nums">{debugInfo.total}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] font-bold text-apple-text-tertiary uppercase tracking-wider">Cobradas</span>
                                                    <span className="text-[12px] font-black text-emerald-600 tabular-nums">{debugInfo.collected}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] font-bold text-apple-text-tertiary uppercase tracking-wider">Ya Pagadas</span>
                                                    <span className="text-[12px] font-black text-apple-blue tabular-nums">{debugInfo.alreadyPaid}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] font-bold text-apple-text-tertiary uppercase tracking-wider">Para Nómina</span>
                                                    <span className="text-[12px] font-black text-apple-red tabular-nums">{debugInfo.pending}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-apple-text-tertiary">Concepto *</label>
                        <input type="text" value={form.concept}
                            onChange={e => setForm(f => ({ ...f, concept: e.target.value }))}
                            readOnly={isNomina && selectedAptIds.length > 0}
                            placeholder={isNomina ? 'Se genera automáticamente' : 'Ej: Consulta psicopedagógica'}
                            className={cn("w-full bg-apple-secondary border border-apple-separator rounded-xl px-4 py-2 text-[14px] font-medium outline-none focus:border-apple-blue transition-all", isNomina && selectedAptIds.length > 0 && "opacity-60 cursor-default")} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-apple-text-tertiary">Monto (MXN) *</label>
                            <input type="number" value={form.amount}
                                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                                readOnly={isNomina && selectedAptIds.length > 0}
                                placeholder="0.00"
                                className={cn("w-full bg-apple-secondary border border-apple-separator rounded-xl px-4 py-2 text-[14px] font-medium outline-none focus:border-apple-blue transition-all", isNomina && selectedAptIds.length > 0 && "font-black text-apple-red opacity-90 cursor-default")} />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-apple-text-tertiary">Método de pago</label>
                            <select value={form.method} onChange={e => setForm(f => ({ ...f, method: e.target.value as any }))}
                                className="w-full bg-apple-secondary border border-apple-separator rounded-xl px-4 py-2 text-[14px] font-medium outline-none focus:border-apple-blue transition-all">
                                <option>Efectivo</option>
                                <option>Transferencia</option>
                                <option>Tarjeta</option>
                            </select>
                        </div>
                    </div>

                    {form.type === 'income' && (
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-black uppercase tracking-widest text-apple-text-tertiary">Cita del día</label>
                                {todayApts.length > 0 && (
                                    <span className="text-[10px] font-bold text-apple-text-tertiary">{todayApts.length} cita{todayApts.length !== 1 ? 's' : ''} hoy</span>
                                )}
                            </div>

                            {todayApts.length === 0 ? (
                                <div className="w-full bg-apple-secondary border border-apple-separator rounded-xl px-4 py-2 flex items-center gap-2 text-apple-text-tertiary cursor-default">
                                    <Calendar className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
                                    <span className="text-[12px]">Sin citas programadas para hoy</span>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto custom-scrollbar pr-0.5">
                                        {todayApts.map(apt => {
                                            const sp = specialists.find(s => s.id === apt.specialistId);
                                            const isSelected = selectedTodayAptId === apt.id;
                                            return (
                                                <button
                                                    key={apt.id}
                                                    type="button"
                                                    onClick={() => handleSelectTodayApt(isSelected ? '' : apt.id)}
                                                    className={cn(
                                                        "text-left px-3 py-2.5 rounded-xl border transition-all",
                                                        isSelected
                                                            ? "bg-apple-black border-apple-black text-apple-bg"
                                                            : "bg-apple-bg border-apple-separator hover:border-apple-text-secondary"
                                                    )}
                                                >
                                                    <div className={cn("text-[12px] font-bold truncate", isSelected ? 'text-white' : 'text-apple-text')}>
                                                        {apt.patientName}
                                                    </div>
                                                    <div className={cn("text-[10px] truncate mt-0.5", isSelected ? 'text-white/60' : 'text-apple-text-tertiary')}>
                                                        {apt.type || 'Consulta'}{sp ? ` · ${sp.name.split(' ')[0]}` : ''}{apt.time ? ` · ${apt.time}` : ''}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {!selectedTodayAptId && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-apple-text-tertiary">Paciente</label>
                                        <input
                                            type="text"
                                            value={form.patientName}
                                            onChange={e => setForm(f => ({ ...f, patientName: e.target.value }))}
                                            placeholder="Nombre del paciente"
                                            className="w-full bg-apple-secondary border border-apple-separator rounded-xl px-4 py-2 text-[14px] font-medium outline-none focus:border-apple-blue transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-apple-text-tertiary">Especialista *</label>
                                        <select
                                            value={form.specialistName}
                                            onChange={e => setForm(f => ({ ...f, specialistName: e.target.value }))}
                                            className="w-full bg-apple-secondary border border-apple-separator rounded-xl px-4 py-2 text-[14px] font-medium outline-none focus:border-apple-blue transition-all appearance-none"
                                        >
                                            <option value="">-- Seleccionar --</option>
                                            {specialists.map(s => (
                                                <option key={s.id} value={s.name}>{s.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-apple-text-tertiary">Nota interna</label>
                        <textarea rows={2} value={form.nota} onChange={e => setForm(f => ({ ...f, nota: e.target.value }))}
                            placeholder="Observación adicional..." className="w-full bg-apple-secondary border border-apple-separator rounded-xl px-4 py-2 text-[14px] font-medium outline-none focus:border-apple-blue transition-all resize-none" />
                    </div>

                    {form.type === 'expense' && (
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-apple-text-tertiary">Comprobante (Opcional)</label>
                            <div className="relative">
                                {receiptFile ? (
                                    <div className="flex items-center justify-between bg-apple-secondary border border-apple-separator rounded-xl py-2 px-3">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <FileText className="w-4 h-4 text-apple-red shrink-0" />
                                            <span className="text-[12px] font-medium text-apple-text truncate">{receiptFile.name}</span>
                                        </div>
                                        <button onClick={() => { setReceiptFile(null); setReceiptBase64(''); }} className="p-1 hover:bg-apple-bg rounded-lg text-apple-text-tertiary hover:text-apple-red transition-colors shrink-0">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex items-center justify-center gap-2 w-full bg-apple-secondary hover:bg-apple-bg border border-dashed border-apple-separator rounded-xl py-3 px-4 text-[13px] font-medium text-apple-text-secondary transition-all cursor-pointer">
                                        <Upload className="w-4 h-4" />
                                        <span>Subir recibo o factura</span>
                                        <input type="file" className="hidden" accept="image/*,.pdf" onChange={handleFileChange} />
                                    </label>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="px-6 py-4 border-t border-apple-separator flex gap-3">
                    <button onClick={onClose} className="flex-1 py-2.5 text-[11px] font-bold uppercase tracking-widest text-apple-text-secondary hover:text-apple-text">
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!canSave || isSaving}
                        className={cn(
                            "flex-1 py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest text-white flex items-center justify-center gap-2 disabled:opacity-40 transition-all",
                            form.type === 'income' ? 'bg-apple-green hover:bg-green-600' : 'bg-apple-red hover:bg-red-600'
                        )}
                    >
                        {isSaving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
                        )}
                        {isSaving ? 'Registrando...' : 'Registrar'}
                    </button>
                </div>
            </div>
        </div>
    );
};
