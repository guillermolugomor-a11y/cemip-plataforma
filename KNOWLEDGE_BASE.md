# CEMIP — Base de Conocimientos del Sistema
> Centro Multidisciplinario de Intervención Psicopedagógico · Morelos, México
> Versión: 1.0 · Actualización: Abril 2026

---

## 1. Visión General

CEMIP es una plataforma clínica web de gestión integral. Permite administrar **pacientes, citas, expedientes clínicos, contabilidad y especialistas** desde un único punto de acceso sin backend externo (en versión actual).

### Stack Tecnológico
| Capa | Tecnología |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite |
| Estilos | Tailwind CSS + CSS Variables (tema claro/oscuro) |
| Estado global | **Zustand** + `persist` middleware |
| Persistencia actual | **localStorage** (por cada store) |
| Íconos | Lucide React |
| PDF | jsPDF + jspdf-autotable |
| Gráficas | Recharts |

---

## 2. Estructura de Carpetas

```
src/
├── App.tsx                 # Shell: navegación, routing, dark mode
├── index.css               # Design system: CSS variables de tema
├── lib/
│   ├── utils.ts            # cn(), generateId(), openReceiptInNewTab()
│   └── dateUtils.ts        # Utilidades de fecha con zona horaria segura
├── types/
│   └── clinical.ts         # Patient, Appointment, EvolutionNote (tipos globales)
└── modules/
    ├── dashboard/          # KPIs resumen
    ├── patients/           # Lista + expediente + registro
    ├── agenda/             # Calendario + historial de citas
    ├── accounting/         # Caja, movimientos, cortes, PDF
    ├── specialists/        # Directorio del equipo médico
    ├── clinical/           # Store compartido para datos clínicos
    ├── anamnesis/          # Historia clínica
    ├── evaluations/        # Pruebas psicométricas
    ├── intervention/       # Plan de intervención y metas
    ├── development/        # Áreas de desarrollo
    ├── timeline/           # Notas de evolución
    ├── reports/            # Informes clínicos
    ├── school/             # Seguimiento escolar
    ├── alerts/             # Alertas clínicas
    └── documents/          # Documentos adjuntos
```

---

## 3. Navegación y Routing

El sistema **no usa React Router**. El routing se maneja con estado en `App.tsx`:

- `activeItem` → módulo principal (`'Dashboard'`, `'Pacientes'`, `'Agenda'`…)
- `subModule` → sub-sección dentro del expediente de un paciente

### Menú Principal (Sidebar)
| ID | Componente |
|---|---|
| `Dashboard` | `DashboardMain` |
| `Pacientes` | `PatientList` → al seleccionar: `PatientSummary` + sub-módulos |
| `Agenda` | `Agenda` (calendario semanal) |
| `Historial` | `AppointmentHistory` (todas las citas) |
| `Contabilidad` | `AccountingDashboard` |
| `Especialistas` | `SpecialistsMain` |

### Sub-módulos del Expediente de Paciente
```
resumen       → PatientSummary
anamnesis     → Anamnesis
evaluaciones  → Evaluations
intervencion  → InterventionPlan
desarrollo    → DevelopmentAreas
notas         → Timeline
reportes      → Reports
seguimiento   → SchoolFollowUp
alertas       → Alerts
documentos    → Documents
citas         → AppointmentHistory (filtrado por patientId)
```

### Layout Responsivo
- **Desktop (lg+):** Sidebar fijo izquierda + área de contenido
- **Mobile:** Sidebar como drawer + barra de navegación inferior con 4 ítems

---

## 4. Stores de Zustand

Todos los stores usan `persist` para guardar en localStorage.

### 4.1 — Patients (en App.tsx con useState)

> **Excepción:** El store de pacientes es `useState` en `App.tsx`, no Zustand.

- **localStorage key:** `cemip_patients_storage`
- **Tipo:** `Patient`

```ts
Patient {
  id, name, lastNamePaterno, lastNameMaterno, age, caseId,
  tutor, relationship, phone, email, birthDate, gender,
  consultReason, initialNotes, attendanceDays[], appointmentTime,
  sessionCost, requiresInvoice,
  schoolName, schoolPhone, schoolEmail, schoolGrade, schoolGroup
}
```

---

### 4.2 — AgendaStore
- **Key:** `cemip-agenda-storage`
- **Tipo:** `Appointment`

```ts
Appointment {
  id, patientId, patientName*, specialistId, specialistName*,
  date (YYYY-MM-DD), time (HH:mm), type, status,
  isPaid, sessionCost, isAccountingLogged
}
// * desnormalizados: solo para display. En BD solo irán los IDs.
```

**Estados de cita:** `pending → confirmed → completed / cancelled`

**Acciones:**
| Acción | Efecto |
|---|---|
| `addAppointment` | Crea con `id = generateId()` |
| `updateStatus` | Cambia estado |
| `updateAppointment` | Actualiza campos |
| `deleteAppointment` | Elimina |
| `markAppointmentsAsPaid` | Marca como pagadas (usado por nómina) |

---

### 4.3 — AccountingStore
- **Key:** `cemip-accounting-v3-storage`
- **Tipos:** `Transaction`, `Caja`, `Corte`

#### Transaction
```ts
{
  id, date, timestamp, amount, concept,
  type: 'income' | 'expense',
  method: 'Efectivo' | 'Tarjeta' | 'Transferencia',
  category, patientId, patientName, specialistId, specialistName,
  clinicRetention,    // 40% del ingreso (auto-calculado)
  specialistPayment,  // 60% del ingreso (auto-calculado)
  cajaId, userName, cancelled, nota, receiptUrl
}
```

#### Caja
```ts
{ id, tipo: 'semanal'|'mensual', fechaApertura, fondoInicial, usuario, estado: 'abierta'|'cerrada' }
```

#### Corte (generado al cerrar caja)
```ts
{ id, tipo, label, fechaInicio, fechaFin, fondoInicial,
  totalIngresos, totalEgresos, flujoNeto,
  efectivoEsperado, efectivoReal, diferencia, usuario, fechaCorte, cajaId }
```

#### Reglas de Negocio Críticas
1. **Distribución 40/60:** `addTransaction` calcula automáticamente `clinicRetention = amount × 0.40` y `specialistPayment = amount × 0.60`. Solo se calcula en el Store, no en los modales.
2. **Anti-duplicación:** Bloquea transacciones idénticas registradas en menos de 30 segundos.
3. **Bloqueo de anulación:** No se puede anular si la caja está `cerrada`.
4. **Efectivo esperado:** `fondoInicial + Σ(ingresos efectivo) − Σ(egresos efectivo)`.

#### Flujo de Caja
```
abrirCaja() → addTransaction() × N → cerrarCaja() → genera Corte
```

#### Selectores disponibles
```ts
getActiveCaja()          // Caja actualmente abierta
getTxsByPeriod(s, e)     // Transacciones en rango de fechas
getTxsByCaja(cajaId)     // Transacciones de una caja específica
sumIngresos(txs)         // Suma de ingresos no cancelados
sumEgresos(txs)          // Suma de egresos no cancelados
getExpectedCash()        // Efectivo esperado en caja activa
getBalance()             // Balance total histórico
```

---

### 4.4 — SpecialistStore
- **Key:** `cemip-specialists-storage`

```ts
Specialist {
  id, name, email, specialty, bankInfo,
  paymentSchema: 'Porcentaje' | 'Sueldo Fijo',
  paymentValue,   // % o monto fijo por sesión
  status: 'Activo' | 'Inactivo'
}
```

**Esquemas de pago al registrar nómina:**
- `Porcentaje`: `sessionCost × (paymentValue / 100)`
- `Sueldo Fijo`: `paymentValue` fijo por sesión

---

### 4.5 — ClinicalStore
- **Key:** `cemip-clinical-storage-v1`
- **Entidades:** `Evaluation`, `Goal`, `ClinicalLog`, `TimelineNote`

| Entidad | Descripción |
|---|---|
| `Evaluation` | Prueba psicométrica: título, fecha, puntaje, conclusión |
| `Goal` | Meta de intervención con progreso 0–100% |
| `ClinicalLog` | Registro de contacto con escuela o familia |
| `TimelineNote` | Nota de evolución por sesión clínica |

Todos se filtran por `patientId` mediante getters:
```ts
getPatientEvaluations(patientId)
getPatientGoals(patientId)
getPatientLogs(patientId)
getPatientNotes(patientId)
```

---

## 5. Sistema de Notificaciones

Generadas en tiempo real con `useMemo` en `App.tsx`. Sin persistencia propia.

**Lógica:**
1. Para cada paciente revisar `attendanceDays[]`
2. Si hoy o mañana es día de asistencia y no existe cita → generar alerta
3. Las alertas descartadas se guardan en `cemip_dismissed_notifications`

```
Patient.attendanceDays[] + AgendaStore.appointments → notifications[]
```

---

## 6. Módulo de Contabilidad — Flujo UI

```
AccountingDashboard
├── Pestañas de período: Hoy / Semana / Mes / Año / Histórico
├── Selector de fecha de referencia (desplaza el período)
├── StatCards: Ingresos · Egresos · Flujo · Caja Efectivo · Balance
├── Gráfica: Ingresos vs Egresos (últimos 3 meses)
├── Vista "Movimientos": tabla de transacciones del período
│   ├── Por cada fila: botón Recibo (ingresos) / Ver Comprobante (egresos)
│   └── Botón Anular (si caja abierta)
└── Vista "Cortes": historial de cierres de caja
    └── Por cada corte: métricas + botón Desglose Detallado + PDF

Modales:
├── TxModal         → Nuevo movimiento (ingreso o egreso)
├── AbrirCajaModal  → Inicializar caja con fondo
├── CerrarCajaModal → Ingresar efectivo real y generar corte
└── CorteDetailModal → Desglose completo de un corte
```

### PDFs generados
| PDF | Función | Contenido |
|---|---|---|
| Recibo de ingreso | `handlePrintReceipt` | Membrete CEMIP, datos paciente, folio, importe en letra, firma |
| Corte de caja | `handleExportPDF` / `CorteDetailModal` | Resumen financiero + desglose de movimientos |

---

## 7. Módulo de Agenda — Flujo

```
Agenda (calendario semanal)
├── Navegar entre semanas
├── Clic en día/slot → AppointmentModal
│   ├── Seleccionar paciente
│   ├── Seleccionar especialista
│   ├── Fecha, hora, tipo de servicio
│   └── Guardar → AgendaStore.addAppointment()
└── Por cada cita: Confirmar / Completar / Cancelar / Editar / Eliminar
```

**AppointmentHistory** funciona en dos modos:
- **Global** (nav `Historial`): todas las citas con filtros por estado y búsqueda
- **Por paciente** (sub-módulo `citas`): recibe `patientId` como prop y filtra

---

## 8. Módulo de Pacientes — Expediente Clínico

```
PatientList → seleccionar → PatientSummary (header con datos + sub-nav)
                                   ↓ sub-módulos
Anamnesis → historia clínica completa
Evaluaciones → pruebas con puntajes y conclusiones
Plan Intervención → metas con barra de progreso
Desarrollo → áreas de desarrollo infantil
Notas Evolución → timeline de sesiones
Informes → generación de reportes PDF
Seguimiento Escolar → contacto y avance en institución educativa
Alertas → alertas clínicas específicas del paciente
Documentos → archivos adjuntos
Citas → historial de citas filtrado
```

---

## 9. Dark Mode

| Aspecto | Detalle |
|---|---|
| Activación | Toggle en header → clase `.dark` en `<html>` |
| Persistencia | `localStorage.setItem('cemip_theme', 'dark'|'light')` |
| Auto-detect | `prefers-color-scheme` si no hay preferencia guardada |
| Implementación | CSS Variables en `:root` y `.dark { }` en `index.css` |

### Variables de Color Clave
| Variable | Modo Claro | Modo Oscuro |
|---|---|---|
| `--color-apple-bg` | Blanco | Negro |
| `--color-apple-secondary` | Gris muy claro | Gris muy oscuro |
| `--color-apple-text` | Negro | Blanco |
| `--color-apple-black` | Negro | **Blanco** ← inversión |
| `--color-apple-separator` | Gris claro | Gris oscuro |

> **Regla crítica:** Dentro de `bg-apple-black`, usar siempre `text-apple-bg` (nunca `text-white`), porque en modo oscuro `apple-black` se vuelve blanco y `text-white` sería invisible.

---

## 10. Utilidades Globales

### `lib/utils.ts`
```ts
cn(...inputs)              // Merge de clases Tailwind (clsx + twMerge)
generateId()               // crypto.randomUUID() — ID único compatible con BD
openReceiptInNewTab(url)   // Abre comprobante en nueva pestaña via iframe
```

### `lib/dateUtils.ts`
```ts
getLocalDateString(date?)    // Fecha YYYY-MM-DD en zona local (NO usa toISOString)
getTomorrowLocalDateString() // Mañana en formato YYYY-MM-DD
getDayNameES(date)           // "Lunes", "Martes"...
formatDisplayDate(str)       // "2026-04-15" → "15 ABR"
```

> **Regla crítica:** Siempre usar `getLocalDateString()` para la fecha actual. Nunca `new Date().toISOString().split('T')[0]` — en México (UTC-6) puede retornar el día anterior antes de las 6am.

---

## 11. localStorage — Inventario de Keys

| Key | Módulo | Contenido |
|---|---|---|
| `cemip_patients_storage` | App.tsx | Array `Patient[]` |
| `cemip_theme` | App.tsx | `'dark'` o `'light'` |
| `cemip_dismissed_notifications` | App.tsx | IDs de alertas descartadas |
| `cemip-agenda-storage` | AgendaStore | `Appointment[]` |
| `cemip-accounting-v3-storage` | AccountingStore | Transacciones + cajas + cortes |
| `cemip-specialists-storage` | SpecialistStore | `Specialist[]` |
| `cemip-clinical-storage-v1` | ClinicalStore | Evaluaciones, metas, logs, notas |

> **Límite de localStorage:** ~5MB. Los comprobantes en base64 pueden saturarlo rápidamente. Planear migración a Supabase Storage antes de producción.

---

## 12. Esquema de BD Recomendado (PostgreSQL / Supabase)

```sql
-- Catálogos
patients     (id uuid PK, case_id, name, age, gender, tutor, phone, email,
              birth_date, consult_reason, session_cost, attendance_days text[],
              school_name, school_grade, school_group, ...)

specialists  (id uuid PK, name, email, specialty, bank_info,
              payment_schema, payment_value, status)

-- Agenda
appointments (id uuid PK, patient_id FK, specialist_id FK,
              date date, time time, type text, status text,
              is_paid bool, session_cost numeric, is_accounting_logged bool)

-- Contabilidad
cajas        (id uuid PK, tipo, fecha_apertura date, fondo_inicial numeric,
              usuario, estado)

transactions (id uuid PK, caja_id FK, date date, timestamp time,
              amount numeric, concept text, type text, method text, category text,
              patient_id FK, specialist_id FK, clinic_retention numeric,
              specialist_payment numeric, cancelled bool, nota text,
              receipt_url text, user_name text)

cortes       (id uuid PK, caja_id FK, tipo, label, fecha_inicio, fecha_fin,
              fondo_inicial, total_ingresos, total_egresos, flujo_neto,
              efectivo_esperado, efectivo_real, diferencia, usuario, fecha_corte)

-- Expediente Clínico
evaluations  (id uuid PK, patient_id FK, title, date, score, status, conclusion)
goals        (id uuid PK, patient_id FK, title, indicator, progress int,
              status, responsible, target_date)
clinical_logs(id uuid PK, patient_id FK, date, type, entity, description, by)
notes        (id uuid PK, patient_id FK, date, time, content,
              specialist_id FK, template_type)
```

### Pasos de Migración
1. Crear proyecto Supabase + variables `.env`
2. Instalar `@supabase/supabase-js` y crear `lib/supabase.ts`
3. Migrar stores uno por uno (empezar por `SpecialistStore`)
4. Implementar la regla 40/60 como **trigger** de BD
5. Migrar comprobantes base64 → **Supabase Storage**
6. Implementar autenticación real (reemplazar `userName: 'Dr. Alejandro'`)
7. Separar `Agenda.tsx` (~46KB) en sub-componentes antes de conectar a BD

---

## 13. Decisiones de Diseño

| Decisión | Razón |
|---|---|
| Sin React Router | App de pantalla única; routing por estado es suficiente |
| Zustand sin Context | Menos boilerplate, acceso directo desde cualquier componente |
| Base64 para comprobantes | No requiere backend; límite: ~5MB de localStorage total |
| `darkMode: 'class'` | Control programático completo, no solo CSS media query |
| `crypto.randomUUID()` | IDs sin colisiones, compatibles con UUID de BD relacional |
| `getLocalDateString()` centralizado | Evita bug de UTC que cambia fecha en México antes de 6am |
