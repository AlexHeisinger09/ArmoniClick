# 💳 Guía de Implementación: Pagos y Facturación en ArmoniClick

## 📋 Tabla de Contenidos
1. [Análisis Actual](#análisis-actual)
2. [Opciones de Pago](#opciones-de-pago)
3. [Arquitectura Propuesta](#arquitectura-propuesta)
4. [Plan de Implementación](#plan-de-implementación)
5. [Comparativa de Procesadores](#comparativa-de-procesadores)

---

## Análisis Actual

### ✅ Lo que YA tienes funcionando:

```
Presupuestos (CRUD completo) ✓
    ↓
Múltiples estados (pendiente → borrador → activo → completed) ✓
    ↓
Vinculación con treatments automática ✓
    ↓
Cálculo de ingresos mensuales ✓
    ↓
Dashboard con métricas ✓
```

### ❌ Lo que FALTA implementar:

```
Sistema de Pagos (NO EXISTE)
    ├── Tabla payments
    ├── Tabla invoices
    ├── Estados de pago
    └── Registro de transacciones

Facturación (PARCIAL)
    ├── PDFs de presupuestos ✓
    ├── PDFs de facturas ✗
    ├── Numeración automática ✗
    └── Email de confirmación ✓ (parcial)

Métodos de Pago (NO EXISTE)
    ├── Efectivo
    ├── Tarjeta de crédito
    ├── Transferencia bancaria
    └── Online (procesador)

Reportes Financieros (NO EXISTE)
    ├── Cuentas por cobrar
    ├── Estado de cobranza
    └── Ingresos efectivamente pagados
```

### 🔍 Problema Conceptual Actual:

Tu sistema considera "ingresos" cuando se **completa un treatment**, pero eso es diferente de "pago recibido":

```
ACTUAL (INCORRECTO):
Treatment completado → Se cuenta como ingreso ($500,000)
✗ Pero... ¿Se pagó realmente?

CORRECTO:
Treatment completado → Presupuesto facturado
                   ↓
              Pago registrado → Se cuenta como ingreso ($500,000)
                   ↓
           Comprobante emitido
```

---

## Opciones de Pago

### Opción 1: Solo Facturación Manual (Recomendado para START)

**Descripción:** Genera facturas digitales pero el pago se registra manualmente.

**Pros:**
- ✅ Implementación rápida (1-2 semanas)
- ✅ No requiere integración con terceros
- ✅ Total control sobre el proceso
- ✅ Bajo costo (solo desarrollo)
- ✅ Funciona con cualquier método de pago

**Contras:**
- ❌ Requiere registro manual de pagos
- ❌ Sin cobro automático
- ❌ Sin validación de pago

**Ideal para:** Clínicas pequeñas/medianas que cobran en efectivo o transferencia

**Costo:** Solo desarrollo (incluido aquí)

---

### Opción 2: Stripe (Recomendado para ONLINE)

**Descripción:** Procesador de pagos online con generación automática de facturas.

**Pros:**
- ✅ Cobro automático con tarjeta/ACH
- ✅ Webhooks para confirmación de pago
- ✅ Soporte para múltiples monedas
- ✅ Dashboard integrado
- ✅ Muy seguro y confiable
- ✅ Excelente documentación

**Contras:**
- ❌ Comisión por transacción (2.9% + $0.30 USD)
- ❌ Requiere SSL/HTTPS
- ❌ Verificación de datos bancarios

**Ideal para:** Clínicas que quieren cobro online directo

**Costo:** Comisión por transacción + plan Stripe (free hasta cierto volumen)

**Soporte en Chile:** ✅ Sí (pesos chilenos)

---

### Opción 3: MercadoPago (Recomendado para LATAM)

**Descripción:** Procesador de pagos latinoamericano con integraciones amplias.

**Pros:**
- ✅ Amplio soporte en Latinoamérica
- ✅ Múltiples métodos de pago locales
- ✅ Wallet integrado
- ✅ Generación automática de facturas
- ✅ Comisiones competitivas
- ✅ Soporte en español

**Contras:**
- ❌ Comisión variable (1.99% - 3.99%)
- ❌ Menos documentación que Stripe
- ❌ Más lento en procesar reportes

**Ideal para:** Clínicas en Latinoamérica

**Costo:** Comisión por transacción

**Soporte en Chile:** ✅ Sí (pesos chilenos + métodos locales)

---

### Opción 4: PayPal (Alternativa Global)

**Descripción:** Solución de pagos global muy conocida.

**Pros:**
- ✅ Amplio conocimiento del usuario
- ✅ Múltiples métodos de pago
- ✅ Cuenta en 190+ países
- ✅ Generación automática de facturas

**Contras:**
- ❌ Comisión alta (3.49% + $0.49)
- ❌ Interfaz menos moderna
- ❌ Menos popular en Latinoamérica

**Ideal para:** Clínicas internacionales

**Costo:** Comisión por transacción

---

### Opción 5: Transbank (Chile Only)

**Descripción:** Procesador de pagos chileno especializado.

**Pros:**
- ✅ Diseñado para Chile
- ✅ Integración con bancos locales
- ✅ Comisión competitive
- ✅ Pagos instantáneos

**Contras:**
- ❌ Solo Chile
- ❌ Documentación limitada
- ❌ Menos features que Stripe

**Ideal para:** Clínicas solo en Chile

**Costo:** Comisión por transacción

---

## Arquitectura Propuesta

### Base de Datos Completa

```sql
-- 1. TABLA DE PAGOS
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  budget_id INTEGER NOT NULL REFERENCES budgets(id),
  amount DECIMAL(10,2) NOT NULL,
  payment_date TIMESTAMP DEFAULT NOW(),
  payment_method VARCHAR(50), -- "cash", "card", "transfer", "online"
  transaction_id VARCHAR(255), -- Para procesadores (Stripe, MP)
  status VARCHAR(50) DEFAULT "pending", -- "pending", "completed", "failed", "refunded"
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
);

-- 2. TABLA DE FACTURAS
CREATE TABLE invoices (
  id SERIAL PRIMARY KEY,
  budget_id INTEGER NOT NULL REFERENCES budgets(id),
  invoice_number VARCHAR(50) UNIQUE NOT NULL, -- "INV-2024-001"
  issue_date TIMESTAMP DEFAULT NOW(),
  due_date TIMESTAMP,
  status VARCHAR(50) DEFAULT "draft", -- "draft", "issued", "paid", "overdue", "cancelled"
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
);

-- 3. TABLA DE MÉTODOS DE PAGO
CREATE TABLE payment_methods (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  type VARCHAR(50), -- "cash", "card", "bank_transfer", "stripe", "mercadopago"
  is_default BOOLEAN DEFAULT false,
  data JSONB, -- Datos sensibles encriptados
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. ACTUALIZAR PRESUPUESTOS
ALTER TABLE budgets ADD COLUMN payment_status VARCHAR(50) DEFAULT "not_paid";
-- Estados: "not_paid", "partial", "paid"

ALTER TABLE budgets ADD COLUMN due_date TIMESTAMP;
ALTER TABLE budgets ADD COLUMN payment_notes TEXT;
```

### Flujo de Pago Propuesto

```
PRESUPUESTO CREADO (status: pendiente)
        ↓
   ACTIVADO (status: activo)
        ↓
   FACTURA GENERADA (invoice status: draft)
        ↓
   ENVIADA AL PACIENTE (invoice status: issued)
        ↓
   PACIENTE ACEPTA (treatment starts)
        ↓
   ┌─────────────────────────────────┐
   │  OPCIÓN A: Pago Manual          │
   │  ─────────────────────          │
   │  Doctor registra pago           │
   │  → payment_status: "paid"       │
   │  → invoice status: "paid"       │
   └─────────────────────────────────┘

   ┌─────────────────────────────────┐
   │  OPCIÓN B: Pago Online          │
   │  ─────────────────────          │
   │  Paciente paga vía Stripe/MP    │
   │  → Webhook confirma pago        │
   │  → payment_status: "paid"       │
   │  → invoice status: "paid"       │
   └─────────────────────────────────┘
        ↓
   TREATMENTS COMPLETADOS
        ↓
   INGRESOS REGISTRADOS (solo si payment_status = "paid")
```

---

## Plan de Implementación

### Fase 1: Base de Datos (1-2 días)

#### Paso 1: Crear migraciones
```bash
npm run drizzle:generate
```

#### Paso 2: Crear esquemas
- `payments.schema.ts`
- `invoices.schema.ts`
- Actualizar `budgets.schema.ts`

#### Paso 3: Aplicar migraciones
```bash
npm run drizzle:push
```

---

### Fase 2: Backend (3-5 días)

#### 1. Servicios de Pago

**Crear:** `netlify/services/payment.service.ts`

```typescript
export class PaymentService {
  // Registrar pago manual
  async recordPayment(budgetId, amount, method, notes) {}

  // Obtener historial de pagos
  async getPaymentHistory(budgetId) {}

  // Actualizar estado de presupuesto
  async updateBudgetPaymentStatus(budgetId) {}

  // Reembolso
  async refundPayment(paymentId) {}
}
```

#### 2. Servicio de Facturas

**Crear:** `netlify/services/invoice.service.ts`

```typescript
export class InvoiceService {
  // Generar factura
  async generateInvoice(budgetId) {}

  // Obtener factura
  async getInvoice(invoiceId) {}

  // Generar PDF
  async generateInvoicePDF(invoiceId) {}

  // Enviar por email
  async sendInvoiceEmail(invoiceId, email) {}

  // Marcar como pagada
  async markAsPaid(invoiceId) {}
}
```

#### 3. Endpoints de Presupuestos Actualizados

**En:** `netlify/functions/budgets/budgets.ts`

```
POST   /api/budgets/{budgetId}/payments          - Registrar pago
GET    /api/budgets/{budgetId}/payments          - Historial de pagos
POST   /api/budgets/{budgetId}/invoice           - Generar factura
GET    /api/budgets/{budgetId}/invoice/{invId}  - Obtener factura
DELETE /api/budgets/{budgetId}/payments/{payId}  - Reembolsar pago
```

#### 4. Integración Stripe (Opcional)

**Crear:** `netlify/services/stripe.service.ts`

```typescript
export class StripeService {
  // Crear sesión de pago
  async createPaymentSession(budgetId, amount) {}

  // Procesar webhook de Stripe
  async handleStripeWebhook(event) {}

  // Validar pago
  async verifyPayment(sessionId) {}
}
```

---

### Fase 3: Frontend (3-5 días)

#### 1. Hooks de Pago

**Crear:** `src/presentation/hooks/budgets/usePayments.ts`

```typescript
export const usePayments = (budgetId) => {
  // Obtener historial de pagos
  const { data: payments } = useQuery(...);

  // Registrar pago
  const { mutate: recordPayment } = useMutation(...);

  // Reembolsar
  const { mutate: refundPayment } = useMutation(...);

  return { payments, recordPayment, refundPayment };
};
```

#### 2. Hooks de Facturas

**Crear:** `src/presentation/hooks/budgets/useInvoices.ts`

```typescript
export const useInvoices = (budgetId) => {
  // Generar factura
  const { mutate: generateInvoice } = useMutation(...);

  // Obtener factura
  const { data: invoice } = useQuery(...);

  // Enviar por email
  const { mutate: sendInvoice } = useMutation(...);

  return { generateInvoice, invoice, sendInvoice };
};
```

#### 3. Componentes UI

**Crear nuevos componentes:**

- `PaymentForm.tsx` - Formulario para registrar pago
- `PaymentHistory.tsx` - Historial de pagos
- `InvoiceGenerator.tsx` - Botón para generar factura
- `PaymentStatus.tsx` - Estado del pago (no pagado, parcial, pagado)

#### 4. Actualizar Dashboard

Agregar widget:
- Cuentas por cobrar (presupuestos sin pagar)
- Ingresos efectivamente pagados vs provisionales
- Facturas pendientes de emisión

---

### Fase 4: Testing (2-3 días)

```bash
# Test de creación de pagos
npm test -- payment.test.ts

# Test de generación de facturas
npm test -- invoice.test.ts

# Test de webhooks Stripe (si se implementa)
npm test -- stripe.webhook.test.ts
```

---

## Comparativa de Procesadores

| Característica | Stripe | MercadoPago | PayPal | Transbank |
|---|---|---|---|---|
| **Comisión** | 2.9% + $0.30 | 1.99-3.99% | 3.49% + $0.49 | ~2.5% |
| **Soporte Chile** | ✅ | ✅✅ | ✅ | ✅✅✅ |
| **Métodos Pago** | 15+ | 15+ | 10+ | Bancos locales |
| **Documentación** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Webhooks** | ✅ | ✅ | ✅ | ✅ |
| **Refunds** | ✅ | ✅ | ✅ | ✅ |
| **Setup** | 30 min | 45 min | 1 hora | 1.5 horas |
| **Mejor para** | Global | LatAm | Global | Chile |

### Recomendación por Caso:

**Solo Chile, sin online:** → Transbank o Manual
**LatAm, con online:** → MercadoPago
**Global, con online:** → Stripe
**No necesita online:** → Manual (implementa esta primero)

---

## Implementación Paso a Paso

### Paso 1: Implementar sin Procesador (1-2 semanas)

Esto es lo que RECOMIENDO hacer PRIMERO:

✅ Tabla de pagos y facturas
✅ Endpoints de pago manual
✅ Generación de facturas en PDF
✅ Dashboard de cuentas por cobrar
✅ Envío de facturas por email

**Beneficio:** Ya tienes control financiero sin complicaciones

---

### Paso 2: Agregar Stripe (1 semana)

Una vez que el sistema manual funciona:

✅ Crear cuenta en Stripe
✅ Integrar SDK de Stripe
✅ Crear sesión de pago
✅ Procesar webhooks
✅ Actualizar estado automático

---

### Paso 3: Reportes Financieros (3-5 días)

Agregar reportes:

✅ Cuentas por cobrar
✅ Ingresos por período
✅ Estado de cobranza
✅ Proyecciones de ingresos

---

## Código de Ejemplo: Implementación Manual

### Backend - Registrar Pago

```typescript
// netlify/functions/budgets/use-cases/record-payment.ts
export class RecordPayment {
  constructor(private paymentService: PaymentService) {}

  async execute(budgetId: number, paymentData: {
    amount: number;
    method: "cash" | "card" | "transfer";
    notes?: string;
  }): Promise<HandlerResponse> {
    try {
      // 1. Validar presupuesto existe
      const budget = await db.select().from(budgetsTable)
        .where(eq(budgetsTable.id, budgetId));

      if (!budget[0]) {
        return { statusCode: 404, body: JSON.stringify({ error: "Presupuesto no existe" }) };
      }

      // 2. Registrar pago
      const [payment] = await db.insert(paymentsTable).values({
        budget_id: budgetId,
        amount: paymentData.amount,
        payment_method: paymentData.method,
        notes: paymentData.notes,
        status: "completed"
      }).returning();

      // 3. Actualizar estado del presupuesto
      const totalPaid = await this.paymentService.getTotalPaid(budgetId);
      const budgetTotal = parseFloat(budget[0].total_amount);

      let paymentStatus = "not_paid";
      if (totalPaid >= budgetTotal) paymentStatus = "paid";
      else if (totalPaid > 0) paymentStatus = "partial";

      await db.update(budgetsTable)
        .set({ payment_status: paymentStatus })
        .where(eq(budgetsTable.id, budgetId));

      // 4. Si está pagado, generar factura automáticamente
      if (paymentStatus === "paid") {
        await new GenerateInvoice().execute(budgetId);
      }

      return {
        statusCode: 200,
        body: JSON.stringify({ payment, paymentStatus })
      };
    } catch (error) {
      return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
  }
}
```

### Frontend - Formulario de Pago

```typescript
// src/presentation/pages/budget/PaymentForm.tsx
export const PaymentForm = ({ budgetId, budgetTotal }) => {
  const form = useForm({
    resolver: zodResolver(paymentSchema)
  });

  const { mutate: recordPayment } = useMutation({
    mutationFn: async (data) =>
      apiFetcher.post(`/budgets/${budgetId}/payments`, data),
    onSuccess: () => {
      toast.success("Pago registrado correctamente");
      queryClient.invalidateQueries(['budget', budgetId]);
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => recordPayment(data))}>

        {/* Monto pagado */}
        <FormField name="amount" control={form.control} render={({ field }) => (
          <FormControl>
            <label>Monto</label>
            <Input {...field} type="number" placeholder="Ej: 500000" />
          </FormControl>
        )} />

        {/* Método de pago */}
        <FormField name="method" control={form.control} render={({ field }) => (
          <FormControl>
            <Select {...field}>
              <option value="cash">Efectivo</option>
              <option value="card">Tarjeta</option>
              <option value="transfer">Transferencia</option>
            </Select>
          </FormControl>
        )} />

        {/* Notas */}
        <FormField name="notes" control={form.control} render={({ field }) => (
          <FormControl>
            <label>Notas (opcional)</label>
            <Textarea {...field} placeholder="Detalles del pago..." />
          </FormControl>
        )} />

        <Button type="submit">Registrar Pago</Button>
      </form>
    </Form>
  );
};
```

---

## Resumen y Recomendación

### 🎯 MI RECOMENDACIÓN:

**Fase 1 (AHORA):** Implementar sistema de pagos manual + facturas
- ⏱️ Tiempo: 1-2 semanas
- 💰 Costo: Solo desarrollo
- 📊 ROI: Inmediato (controlas finanzas)

**Fase 2 (En 1-2 meses):** Agregar Stripe
- ⏱️ Tiempo: 1 semana
- 💰 Costo: Comisión Stripe
- 📊 ROI: Alto (cobros automáticos)

**Fase 3 (Opcional):** Reportes avanzados y proyecciones

---

## Próximos Pasos

1. **¿Quieres que implemente el sistema de pagos manual primero?**
   - Puedo hacerlo en la próxima sesión

2. **¿Tienes preferencia por procesador de pago?**
   - Stripe, MercadoPago, Transbank, Manual

3. **¿Necesitas facturación legal o solo digital?**
   - Legal requiere integraciones con SII (Chile)

4. **¿Qué métodos de pago necesitas soportar?**
   - Efectivo, Tarjeta, Transferencia, Online

---

## Archivos que necesitarías crear

```
netlify/data/schemas/
├── payment.schema.ts (NUEVO)
└── invoice.schema.ts (NUEVO)

netlify/services/
├── payment.service.ts (NUEVO)
└── invoice.service.ts (NUEVO)

netlify/functions/budgets/use-cases/
├── record-payment.ts (NUEVO)
├── get-payment-history.ts (NUEVO)
├── generate-invoice.ts (NUEVO)
└── send-invoice-email.ts (NUEVO)

src/core/use-cases/budgets/
├── recordPaymentUseCase.ts (NUEVO)
├── getPaymentHistoryUseCase.ts (NUEVO)
└── generateInvoiceUseCase.ts (NUEVO)

src/presentation/hooks/budgets/
├── usePayments.ts (NUEVO)
└── useInvoices.ts (NUEVO)

src/presentation/pages/budget/
├── PaymentForm.tsx (NUEVO)
├── PaymentHistory.tsx (NUEVO)
└── InvoiceView.tsx (NUEVO)
```

---

¿Por dónde te gustaría empezar? 🚀
