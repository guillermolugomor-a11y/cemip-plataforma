# CEMIP — Manual de Usuario
> Centro Multidisciplinario de Intervención Psicopedagógico · Cuernavaca, Morelos
> Versión 1.0 · Abril 2026

---

## Contenido

1. [Primeros Pasos](#1-primeros-pasos)
2. [Panel Principal (Dashboard)](#2-panel-principal-dashboard)
3. [Pacientes](#3-pacientes)
4. [Agenda](#4-agenda)
5. [Historial de Citas](#5-historial-de-citas)
6. [Contabilidad](#6-contabilidad)
7. [Especialistas](#7-especialistas)
8. [Expediente Clínico](#8-expediente-clínico)
9. [Modo Oscuro](#9-modo-oscuro)
10. [Preguntas Frecuentes](#10-preguntas-frecuentes)

---

## 1. Primeros Pasos

### Acceder al sistema
Abra CEMIP desde su navegador web (Chrome o Edge recomendados). No requiere instalación ni contraseña en la versión actual.

### Interfaz general

```
┌─────────────────────────────────────────────────────┐
│  CEMIP  [🔍] [🔔] [☀️/🌙]          Header          │
├──────────┬──────────────────────────────────────────┤
│          │                                          │
│ Sidebar  │         Área de contenido                │
│          │                                          │
│ Dashboard│                                          │
│ Pacientes│                                          │
│ Agenda   │                                          │
│ Historial│                                          │
│ Contabil.│                                          │
│ Especial.│                                          │
│          │                                          │
└──────────┴──────────────────────────────────────────┘
```

- **Sidebar izquierdo:** menú de navegación principal (en móvil se oculta con el ícono ☰)
- **Header superior:** búsqueda global, notificaciones y toggle de tema
- **Área central:** contenido del módulo activo

### Notificaciones 🔔
El ícono de campana muestra alertas automáticas cuando un paciente tiene día de sesión programado pero **no tiene cita agendada**. Haga clic en la alerta para ir directamente a la agenda.

---

## 2. Panel Principal (Dashboard)

El Dashboard es la pantalla de inicio. Muestra un resumen operativo del día.

### Qué encontrará aquí
- **Citas del día:** lista de pacientes con sesión hoy, con su estado (Pendiente / Confirmada)
- **Botones de acción rápida:** Confirmar y Reagendar directamente desde el dashboard
- **Estadísticas generales:** total de pacientes, especialistas activos y citas de la semana

### Acciones disponibles
| Botón | Qué hace |
|---|---|
| ✓ Confirmar | Cambia el estado de la cita a "Confirmada" |
| ↺ Reagendar | Abre el formulario para editar fecha y hora |

---

## 3. Pacientes

### 3.1 Ver la lista de pacientes

Haga clic en **Pacientes** en el menú lateral. Verá la lista completa con:
- Nombre completo y número de expediente
- Tutor responsable y teléfono
- Días de asistencia configurados

Use la **barra de búsqueda** para filtrar por nombre o número de expediente.

### 3.2 Registrar un nuevo paciente

1. Haga clic en el botón **"+ Nuevo Paciente"** (esquina superior derecha)
2. Complete el formulario dividido en secciones:

| Sección | Campos |
|---|---|
| **Datos del paciente** | Nombre(s), apellidos, fecha de nacimiento, género |
| **Motivo de consulta** | Razón de consulta y notas iniciales |
| **Datos del tutor** | Nombre, parentesco, teléfono |
| **Horario** | Días de asistencia, horario, costo por sesión |
| **Escuela** | Nombre, teléfono, correo, grado y grupo |

3. Haga clic en **"Guardar Paciente"**

> **Tip:** Los **Días de asistencia** son importantes: el sistema generará alertas automáticas cuando llegue ese día y no haya cita agendada.

### 3.3 Editar un paciente

En la lista, haga clic en el ícono de **lápiz ✏️** sobre la tarjeta del paciente. Se abrirá el mismo formulario con los datos actuales para editar.

### 3.4 Eliminar un paciente

Haga clic en el ícono de **papelera 🗑️**. El sistema pedirá confirmación antes de eliminar el expediente.

> ⚠️ **Atención:** La eliminación es permanente. Se perderán todos los datos del expediente.

### 3.5 Abrir el expediente de un paciente

Haga clic sobre el nombre del paciente en la lista. Entrará al **Expediente Clínico** con un menú de sub-módulos en la parte superior.

---

## 4. Agenda

La agenda muestra un **calendario semanal** con todas las citas organizadas por día y hora.

### 4.1 Navegar entre semanas

Use los botones **← Anterior** y **Siguiente →** para moverse entre semanas. El botón **"Hoy"** regresa a la semana actual.

### 4.2 Crear una nueva cita

1. Haga clic en el botón **"+ Nueva Cita"** (en el header de la agenda) o directamente en un día del calendario
2. Complete el formulario:
   - **Paciente:** seleccione de la lista
   - **Especialista:** seleccione del equipo médico
   - **Fecha:** se pre-llena con el día seleccionado
   - **Hora:** seleccione de los horarios disponibles (9:00 a 19:30, intervalos de 30 min)
   - **Tipo de servicio:** Sesión Terapia / Evaluación / Seguimiento / Entrega de informes
3. Haga clic en **"Confirmar Cita"**

### 4.3 Gestionar una cita existente

Al hacer clic sobre una cita del calendario, verá las opciones:

| Acción | Cuándo usarla |
|---|---|
| ✓ **Confirmar** | Paciente confirmó asistencia (pending → confirmed) |
| ● **Completar** | Paciente asistió a la sesión (confirmed → completed) |
| ✕ **Cancelar** | Paciente no pudo asistir |
| ✏️ **Editar** | Modificar fecha, hora o tipo de cita |
| 🗑️ **Eliminar** | Borrar la cita del sistema |

### 4.4 Estados de una cita

```
⚪ Pendiente  →  🔵 Confirmada  →  🟢 Completada
                              ↘  🔴 Cancelada
```

### 4.5 Citas y Contabilidad

Cuando un paciente completa su sesión, esta cita puede ser registrada como **ingreso** en contabilidad. Al registrar el pago, la cita se marcará automáticamente como `Pagada` (✓ verde).

---

## 5. Historial de Citas

Muestra **todas las citas registradas** en el sistema con filtros avanzados.

### Filtros disponibles
- **Buscador:** nombre del paciente, especialista o tipo de cita
- **Estado:** Todos / Asistió / Cancelada / Confirmada / Pendiente
- **Orden:** Más recientes primero o Más antiguas primero

### Estadísticas en el encabezado
Al ingresar sin filtro de paciente, verá tarjetas con conteo de:
`Total · Asistidas · Confirmadas · Pendientes · Canceladas`

### Ver el historial de un paciente específico
Desde el **Expediente del paciente** → sub-módulo **"Citas"**. Mostrará solo las citas de ese paciente.

---

## 6. Contabilidad

El módulo financiero registra todos los movimientos de dinero del centro.

### 6.1 Concepto de Caja

La **caja** representa un período contable (semanal o mensual). Debe:
1. **Abrirse** al inicio del período con un fondo inicial en efectivo
2. Registrar todos los **movimientos** (ingresos y egresos) durante el período
3. **Cerrarse** al final ingresando el efectivo físico contado

> ⚠️ **Sin caja abierta** no es posible registrar movimientos.

### 6.2 Abrir Caja

1. Haga clic en **"Abrir Caja"** (aparece cuando no hay caja activa)
2. Ingrese el **fondo inicial** (dinero en efectivo disponible al inicio)
3. Seleccione el tipo: **Semanal** o **Mensual**
4. Haga clic en **"Abrir Caja"**

El indicador verde **"Caja abierta"** aparecerá en el encabezado.

### 6.3 Registrar un Movimiento

Haga clic en **"+ Movimiento"** y seleccione el tipo:

#### Ingreso (+ verde)
Para registrar un pago recibido:

| Campo | Descripción |
|---|---|
| Fecha | Fecha del cobro |
| Categoría | Consulta / Evaluación / Terapia / Asesoría / Otro |
| Cita de hoy | Seleccione una cita para auto-rellenar datos del paciente |
| Concepto | Descripción del servicio |
| Monto | Cantidad cobrada |
| Método | Efectivo / Tarjeta / Transferencia |

> **Distribución automática:** El sistema calcula automáticamente el 40% para la clínica y el 60% para el especialista.

#### Egreso (− rojo)
Para registrar un gasto del centro:

| Categoría | Uso típico |
|---|---|
| **Honorarios** | Pago a especialistas (sueldo por sesiones) |
| **Nómina** | Pago estructurado vinculado a citas completadas |
| **Renta** | Pago de instalaciones |
| **Suministros** | Materiales y papelería |
| **Servicios** | Servicios básicos (agua, luz, internet) |
| **Otro** | Cualquier otro gasto |

##### Pago de Nómina (especial)
1. Seleccione categoría **"Nómina"**
2. Seleccione el **especialista** a pagar
3. Marque las **citas completadas** que se van a pagar
4. El monto se calcula automáticamente según el esquema de pago del especialista
5. Adjunte el comprobante si tiene (imagen o PDF)

#### Comprobante de pago (egresos)
- Haga clic en **"Subir Comprobante"**
- Seleccione una imagen (JPG, PNG) o PDF
- El comprobante queda adjunto al movimiento y puede verse después

### 6.4 Filtros de Período

Use las pestañas para ver movimientos de diferentes períodos:

| Pestaña | Período mostrado |
|---|---|
| **Hoy** | Solo movimientos del día actual |
| **Semana** | Lunes a domingo de la semana actual |
| **Mes** | Del 1 al último día del mes actual |
| **Año** | Todos los movimientos del año |
| **Histórico** | Todos los registros del sistema |

Puede **cambiar la fecha de referencia** con el selector de fecha para ver períodos pasados.

### 6.5 Anular un Movimiento

Si un movimiento fue registrado por error:
1. Haga clic en el ícono 🚫 (a la derecha del movimiento)
2. Confirme la anulación en el diálogo que aparece
3. El movimiento quedará marcado como **ANULADO** con tachado y ya no afectará los totales

> ⚠️ **No se pueden anular movimientos de una caja ya cerrada.**

### 6.6 Generar Recibo de Pago

Para cualquier ingreso registrado:
1. Haga clic en el ícono 📄 (columna de acciones)
2. Revise o ajuste los datos (fecha, concepto, monto, paciente)
3. Haga clic en **"Generar PDF Ahora"**
4. El recibo se descargará con membrete oficial CEMIP, folio único e importe en letra

### 6.7 Cerrar Caja y Generar Corte

Al final del período:
1. Haga clic en **"Cerrar Caja"**
2. Cuente el **efectivo físico** que hay en caja
3. Ingrese el monto en el campo "Efectivo Real"
4. El sistema mostrará la **diferencia** entre lo esperado y lo contado
5. Confirme el cierre → se genera automáticamente el **Corte de Caja**

### 6.8 Ver Cortes de Caja

Haga clic en la pestaña **"Cortes"** para ver el historial de períodos cerrados. Por cada corte puede:
- Ver el **desglose detallado** (botón "Ver Desglose Detallado")
- Descargar el **PDF oficial** del corte

---

## 7. Especialistas

Administra el directorio del equipo médico del centro.

### 7.1 Ver el directorio

Ingrese a **Especialistas** en el menú. Verá tarjetas con:
- Nombre y correo electrónico
- Especialidad
- Esquema de pago y estado (Activo / Inactivo)

### 7.2 Registrar un nuevo especialista

1. Haga clic en **"+ Nuevo Especialista"**
2. Complete los datos:
   - Nombre completo
   - Correo electrónico
   - Especialidad
   - Información bancaria
   - **Esquema de pago:**
     - *Porcentaje:* se le paga X% del costo de cada sesión
     - *Sueldo Fijo:* se le paga una cuota fija por sesión

### 7.3 Cambiar estado Activo / Inactivo

En la tarjeta del especialista, haga clic en el botón de estado (verde **Activo** / gris **Inactivo**). Solo los especialistas **Activos** aparecen disponibles al crear citas.

---

## 8. Expediente Clínico

Al seleccionar un paciente, se abre su expediente completo con los siguientes sub-módulos accesibles desde el menú superior:

### 8.1 Resumen
Vista general del paciente: datos personales, información de contacto del tutor, días de asistencia y costos.

### 8.2 Anamnesis
Historia clínica completa del paciente. Registra:
- Motivo de consulta y antecedentes
- Desarrollo evolutivo
- Contexto familiar y escolar

### 8.3 Evaluaciones
Registro de pruebas psicométricas y evaluaciones aplicadas:
- Nombre de la prueba (WISC-V, etc.)
- Fecha de aplicación
- Puntaje obtenido
- Conclusiones del evaluador

### 8.4 Plan de Intervención
Gestión de las metas terapéuticas del paciente:
- Cada meta tiene un **indicador de logro** y **fecha límite**
- La barra de progreso muestra el avance (0–100%)
- Al alcanzar 100%, la meta se marca como **Lograda** ✓

### 8.5 Áreas de Desarrollo
Seguimiento del desarrollo del paciente por áreas (cognitiva, motora, lenguaje, etc.).

### 8.6 Notas de Evolución
Timeline cronológico de las notas clínicas de cada sesión. Registra fecha, especialista y contenido de la nota.

### 8.7 Informes
Generación de informes clínicos formales del paciente en formato PDF.

### 8.8 Seguimiento Escolar
Registra la comunicación y coordinación con la institución educativa del paciente:
- Contactos realizados (llamadas, reuniones)
- Acuerdos y compromisos
- Avance reportado por la escuela

### 8.9 Alertas
Alertas clínicas específicas del paciente que requieren atención del equipo.

### 8.10 Documentos
Repositorio de archivos del paciente: estudios, diagnósticos previos, autorizaciones, etc.

### 8.11 Citas
Historial completo de las citas del paciente con sus estados y datos de pago.

---

## 9. Modo Oscuro

El sistema incluye un modo oscuro con alto contraste para trabajar en ambientes con poca luz.

### Activar / Desactivar
Haga clic en el ícono **☀️ / 🌙** en la esquina superior derecha del header.

El sistema **recuerda su preferencia** automáticamente para la próxima vez que ingrese. Si nunca lo ha configurado, detectará automáticamente la preferencia de su sistema operativo.

---

## 10. Preguntas Frecuentes

### ¿Por qué no puedo registrar movimientos en contabilidad?
Debe tener una **caja abierta**. Haga clic en "Abrir Caja" e ingrese el fondo inicial.

### ¿Cómo pago la nómina de un especialista?
En Contabilidad → **"+ Movimiento"** → seleccione **"Egreso"** → categoría **"Nómina"** → seleccione al especialista → marque las citas completadas → el monto se calcula solo → guarde.

### ¿Por qué no aparece un especialista al crear una cita?
Verifique que el especialista tenga estado **"Activo"** en el módulo de Especialistas.

### ¿Puedo anular un movimiento de un período ya cerrado?
No. Los movimientos de cajas cerradas están **bloqueados** para garantizar la integridad del historial financiero. Si hay un error, deberá crear un movimiento de ajuste en la caja actual.

### ¿Dónde veo cuánto dinero efectivo debo tener en caja?
En el Dashboard de Contabilidad → tarjeta **"Caja (efectivo)"**. Muestra el efectivo esperado sumando el fondo inicial más todos los ingresos en efectivo menos los egresos en efectivo.

### ¿Qué pasa si registro el mismo pago dos veces?
El sistema detecta movimientos duplicados (mismo concepto, monto y fecha en menos de 30 segundos) y **bloquea automáticamente** el registro duplicado.

### ¿Cómo genero un recibo para un paciente?
En Contabilidad → columna de movimientos → haga clic en el ícono 📄 del ingreso correspondiente → ajuste los datos si es necesario → **"Generar PDF Ahora"**.

### ¿Las alertas de pacientes son automáticas?
Sí. Si configura los **Días de asistencia** en el perfil del paciente, el sistema generará automáticamente una alerta en el ícono 🔔 cuando llegue ese día y no haya cita agendada.

### ¿Puedo ver comprobantes de egreso después de subirlos?
Sí. En la lista de movimientos, los egresos con comprobante muestran un ícono 📄 verde. Al hacer clic, se abre el comprobante en una nueva pestaña del navegador.

### ¿Los datos se guardan automáticamente?
Sí. Todos los datos se guardan **instantáneamente** en el navegador al confirmar cada operación. No es necesario presionar un botón de guardar general.

> **Nota importante:** Los datos se almacenan en el navegador de este dispositivo. Si cambia de computadora o borra la caché del navegador, los datos no estarán disponibles. Se recomienda la migración a base de datos en la nube para uso clínico formal.

---

*Manual preparado para el equipo administrativo y clínico de CEMIP Morelos.*
*Para soporte técnico, contacte al administrador del sistema.*
