# 📋 Guía de Integración: SII (Boletas Electrónicas) en ArmoniClick

## 🇨🇱 ¿Qué es el SII?

El **Servicio de Impuestos Internos (SII)** es la autoridad tributaria chilena que requiere que toda clínica/empresa emita boletas o facturas electrónicas.

**Boleta Electrónica vs Manual:**
- **Manual**: La que imprimes en papel (en desuso, ahora es ilegal para algunos servicios)
- **Electrónica**: La que generas digitalmente y registras en el SII

---

## 📊 Análisis de Complejidad

### ¿Es DIFÍCIL? Respuesta honesta:

```
COMPLEJIDAD: ⭐⭐⭐⭐ (4/5 - MUY ALTA)

RAZONES:
1. Requiere certificado digital del SII (RUT)
2. Requiere firma digital (certificado X.509)
3. Validaciones complejas del SII
4. Cambios frecuentes en normativa
5. Multas altas por errores (hasta $50,000,000 CLP)
6. API del SII es compleja y poco documentada
7. Requiere sincronización en tiempo real
8. Auditoria del SII es muy estricta
```

### Comparación:

```
Registrar pago manual:         ⭐ (1/5)
Generar factura con logo:      ⭐⭐ (2/5)
Integrar Stripe:               ⭐⭐⭐ (3/5)
Integrar SII:                  ⭐⭐⭐⭐ (4/5) ← AQUÍ ESTAMOS
Integrar Hacienda + SII:       ⭐⭐⭐⭐⭐ (5/5)
```

---

## 🔴 ADVERTENCIA IMPORTANTE

### ⚠️ ANTES DE IMPLEMENTAR, DEBES TENER:

```
1. RUT de la clínica registrado en SII
2. Certificado digital vigente (de una CA autorizada)
   - Costo: $50,000 - $150,000 CLP/año
   - Renovación: Cada año
3. Resolución especial del SII (para boleta electrónica)
   - Solicitud: En línea en el SII
   - Aprobación: 10-15 días
4. Software aprobado por SII (lista de software autorizado)
   - ArmoniClick DEBE estar en la lista del SII
   - O usar un intermediario autorizado
5. Declaración de IVA correcta
6. RUT y contraseña del SII actualizados
```

### 📋 Checklist de Requisitos:

- [ ] ¿Tu clínica está registrada en el SII?
- [ ] ¿Tienes RUT de la clínica?
- [ ] ¿Tienes certificado digital vigente?
- [ ] ¿Has solicitado resolución de boleta electrónica?
- [ ] ¿Tu software está aprobado por el SII?
- [ ] ¿Sabes cuál es tu folio inicial de boletas?

---

## 🛠️ Opciones Disponibles

### OPCIÓN A: Usar Software Autorizado del SII (RECOMENDADO)

**¿Qué es?**
Usar un software intermediario que ya está autorizado por el SII y simplemente conectas tu clínica.

**Ejemplos:**
- **Consigo** (https://www.consigo.cl/)
- **Facturación.pro** (https://facturacion.pro/)
- **Docu** (https://docu.cl/)
- **UltraFE** (https://www.ultrafe.cl/)
- **LibreOffice (con UNO)**

**Pros:**
✅ Ya está aprobado por el SII
✅ Menos riesgo legal
✅ Soporte técnico incluido
✅ Actualizaciones automáticas
✅ No necesitas mantener certificados
✅ Más barato que desarrollar propio

**Contras:**
❌ Menos control
❌ Costo mensual ($50,000-$200,000 CLP/mes)
❌ Dependencia de tercero
❌ Datos en servidor de tercero

**Costo:** $600,000 - $2,400,000 CLP/año
**Tiempo:** 2-3 horas (integración)
**Complejidad:** ⭐ (1/5)

**Recomendación:** ✅ MEJOR OPCIÓN

---

### OPCIÓN B: Desarrollar Integración Propia (NO RECOMENDADO)

**¿Qué es?**
Conectar directamente con los servicios web del SII usando sus APIs.

**Requisitos técnicos:**
- Certificado digital en formato PKCS12 (.pfx)
- Conexión HTTPS a servicios del SII
- Firma digital de documentos (XML)
- Validaciones complejas de datos
- Sincronización de estado

**Pros:**
✅ Control total
✅ Sin comisiones mensuales
✅ Datos en tu servidor

**Contras:**
❌ MUY complejo de implementar
❌ ALTÍSIMO riesgo legal/financiero
❌ Requiere certificado digital y mantenimiento
❌ Multas del SII muy altas si hay errores
❌ Necesitas mantener actualizado con normativa SII
❌ Documentación SII es pobre
❌ No hay soporte del SII
❌ Requiere auditoría del SII
❌ Cambios normativos cada 6 meses

**Costo:**
- Desarrollo: $3,000,000-$8,000,000 CLP (1-2 meses)
- Certificado digital: $50,000-$150,000 CLP/año
- Mantenimiento: $200,000+ CLP/mes

**Tiempo:** 4-8 semanas
**Complejidad:** ⭐⭐⭐⭐⭐ (5/5)

**Recomendación:** ❌ NO HAGAS ESTO

---

### OPCIÓN C: Solución Híbrida (MEJOR PARA CRECER)

**¿Qué es?**
Usa un software intermedio AHORA, y en el futuro considera desarrollar tu propia solución si creces mucho.

**Roadmap:**
```
AÑO 1-2: Usar Consigo/Facturación.pro
           ├─ Aprendes cómo funciona el SII
           ├─ Tu software está aprobado
           ├─ Generas historial
           └─ Pagas comisión (necesario)

AÑO 3+: Si crecimiento justifica
        ├─ Desarrolla integración propia
        ├─ Migra datos a tu sistema
        ├─ Negocia con SII para aprobación
        └─ Elimina comisiones
```

**Pros:**
✅ Bajo riesgo inicial
✅ Cumples norma SII inmediatamente
✅ Creces con seguridad
✅ Opción de evolucionar después

**Contras:**
❌ Pagas comisión inicialmente
❌ Dependencia de tercero en el corto plazo

**Costo:** $600,000-$2,400,000 CLP/año
**Tiempo:** 2-3 horas (integración)
**Complejidad:** ⭐ (1/5)

**Recomendación:** ✅ MEJOR OPCIÓN PARA TI

---

## 📊 Comparativa de Opciones

| Aspecto | Software Autorizado | Desarrollo Propio | Híbrido |
|---------|-------------------|-------------------|---------|
| **Complejidad** | ⭐ | ⭐⭐⭐⭐⭐ | ⭐ |
| **Costo Inicial** | Bajo | Alto | Bajo |
| **Costo Anual** | $600K-$2.4M | $50K-$200K | $600K-$2.4M |
| **Riesgo Legal** | Muy bajo | Muy alto | Muy bajo |
| **Control** | Bajo | Total | Bajo→Alto |
| **Soporte** | ✅ | ❌ | ✅ |
| **Aprobación SII** | Ya está ✅ | Necesita auditoría | Ya está ✅ |
| **Tiempo Setup** | 2-3 horas | 4-8 semanas | 2-3 horas |
| **Recomendación** | MEJOR AHORA | NO HAGAS | MEJOR FUTURO |

---

## 🚀 PLAN RECOMENDADO PARA TI

### FASE 1 (AHORA): Sistema Manual de Facturación

Tu aplicación genera:
- Facturas en PDF con logo/datos
- Numeración manual (1001, 1002, 1003...)
- Registro en Excel o BD
- **NO VINCULADAS AL SII**

```
Tiempo: 1-2 semanas
Costo: Solo desarrollo
Riesgo: BAJO (solo es documento, no es boleta legal)
```

### FASE 2 (En 3-6 meses): Integrar Software Autorizado

Conectas con **Consigo** o **Facturación.pro**:
- Tus facturas → Sistema intermedio
- Sistema intermedio → SII
- Boletas válidas legalmente
- Cumples normativa SII

```
Tiempo: 2-3 horas
Costo: $50,000-$200,000/mes
Riesgo: MUY BAJO (software aprobado por SII)
Aprobación SII: NO NECESARIA (ya está)
```

### FASE 3 (Opcional, Año 2-3): Desarrollo Propio

Si tu volumen justifica, desarrollas integración propia.

```
Tiempo: 4-8 semanas
Costo: $3M-$8M desarrollo + mantenimiento
Riesgo: MUY ALTO
Requiere: Auditoría SII
```

---

## 💡 MI RECOMENDACIÓN ESPECÍFICA

```
┌─────────────────────────────────────────────┐
│ OPCIÓN ELEGIDA: Software Autorizado         │
│ (Consigo o Facturación.pro)                 │
│                                             │
│ RAZONES:                                    │
│ • Ya está aprobado por SII                  │
│ • Mínimo riesgo legal                       │
│ • Integración simple (2-3 horas)            │
│ • Soporte técnico incluido                  │
│ • Permite crecer sin problemas              │
│ • Después puedes cambiar a desarrollo       │
│   propio si lo necesitas                    │
│                                             │
│ COSTO: ~$1,200,000 CLP/año                  │
│ (Para clínica pequeña-mediana)              │
│                                             │
│ FLUJO:                                      │
│ 1. Registra cliente en Consigo              │
│ 2. Conecta API ArmoniClick ↔ Consigo        │
│ 3. Cuando generas factura:                  │
│    Envías datos a Consigo                   │
│    Consigo genera boleta en SII             │
│    Recibes PDF firmado                      │
│ 4. Envías PDF al paciente                   │
└─────────────────────────────────────────────┘
```

---

## 🔧 Integración Técnica (Software Autorizado)

### Flujo Propuesto:

```
ArmoniClick (Tu app)
    ↓
API de Consigo/Facturación.pro
    ↓
SII (Sistema Interno del Fisco)
    ↓
Boleta Válida Legalmente
    ↓
Enviar a Paciente (PDF firmado)
```

### Código de Ejemplo (Pseudocódigo):

```typescript
// netlify/services/sii-integration.service.ts

export class SIIIntegrationService {
  private apiKey: string;
  private apiUrl = "https://api.consigo.cl/v1"; // Ej: Consigo

  /**
   * Generar boleta a través de software autorizado
   */
  async generateBoleta(invoiceData: {
    patientRUT: string;
    patientName: string;
    items: { description: string; amount: number }[];
    total: number;
    budgetId: number;
  }) {
    try {
      // 1. Validar que presupuesto existe
      const budget = await db.select().from(budgetsTable)
        .where(eq(budgetsTable.id, invoiceData.budgetId));

      if (!budget[0]) {
        throw new Error("Presupuesto no encontrado");
      }

      // 2. Preparar datos para SII
      const boletaData = {
        rut_cliente: invoiceData.patientRUT,
        nombre_cliente: invoiceData.patientName,
        items: invoiceData.items,
        monto_total: invoiceData.total,
        referencia_interna: `BUDGET-${invoiceData.budgetId}`
      };

      // 3. Enviar a software autorizado (Consigo)
      const response = await fetch(`${this.apiUrl}/boletas`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(boletaData)
      });

      const result = await response.json();

      // 4. Guardar referencia en BD
      if (result.success) {
        await db.insert(invoicesTable).values({
          budget_id: invoiceData.budgetId,
          sii_reference: result.boleta_id,
          sii_url_pdf: result.pdf_url,
          status: "issued"
        });

        console.log("✅ Boleta generada en SII:", result.boleta_id);

        return {
          success: true,
          boletaId: result.boleta_id,
          pdfUrl: result.pdf_url
        };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("❌ Error generando boleta SII:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Validar estado de boleta en SII
   */
  async getBoleteStatus(boletaId: string) {
    try {
      const response = await fetch(
        `${this.apiUrl}/boletas/${boletaId}`,
        {
          headers: { "Authorization": `Bearer ${this.apiKey}` }
        }
      );

      return await response.json();
    } catch (error) {
      console.error("❌ Error obteniendo estado:", error);
      throw error;
    }
  }

  /**
   * Enviar boleta por email
   */
  async sendBoleteaByEmail(boletaId: string, recipientEmail: string) {
    try {
      const response = await fetch(`${this.apiUrl}/boletas/${boletaId}/send`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: recipientEmail })
      });

      return await response.json();
    } catch (error) {
      console.error("❌ Error enviando boleta:", error);
      throw error;
    }
  }
}
```

### Endpoint en ArmoniClick:

```typescript
// netlify/functions/budgets/use-cases/generate-sii-boleta.ts

export class GenerateSIIBoleta {
  constructor(
    private siiService: SIIIntegrationService,
    private invoiceService: InvoiceService
  ) {}

  async execute(budgetId: number): Promise<HandlerResponse> {
    try {
      // 1. Obtener presupuesto con items
      const budget = await db.select()
        .from(budgetsTable)
        .where(eq(budgetsTable.id, budgetId));

      if (!budget[0]) {
        return { statusCode: 404, body: JSON.stringify({ error: "No encontrado" }) };
      }

      // 2. Obtener paciente
      const patient = await db.select()
        .from(patientsTable)
        .where(eq(patientsTable.id, budget[0].patient_id));

      // 3. Generar boleta en SII
      const boletaResult = await this.siiService.generateBoleta({
        patientRUT: patient[0].rut,
        patientName: patient[0].name,
        items: await this.getInvoiceItems(budgetId),
        total: parseFloat(budget[0].total_amount),
        budgetId
      });

      if (!boletaResult.success) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: boletaResult.error })
        };
      }

      // 4. Registrar en BD
      await db.update(invoicesTable)
        .set({
          sii_reference: boletaResult.boletaId,
          status: "issued"
        })
        .where(eq(invoicesTable.budget_id, budgetId));

      // 5. Enviar por email
      await this.siiService.sendBoleteaByEmail(
        boletaResult.boletaId,
        patient[0].email
      );

      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          boletaId: boletaResult.boletaId,
          pdfUrl: boletaResult.pdfUrl
        })
      };
    } catch (error) {
      return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
  }

  private async getInvoiceItems(budgetId: number) {
    const items = await db.select()
      .from(budgetItemsTable)
      .where(eq(budgetItemsTable.budget_id, budgetId));

    return items.map(item => ({
      description: item.accion,
      amount: parseFloat(item.valor)
    }));
  }
}
```

---

## 📋 Softwares Autorizados Recomendados (Chile)

### 1. **CONSIGO** ⭐⭐⭐⭐⭐ (RECOMENDADO)

**Página:** https://www.consigo.cl/
**Documentación API:** https://api.consigo.cl/docs

Pros:
- ✅ Muy popular en Chile
- ✅ Excelente documentación API
- ✅ Soporte en español
- ✅ Precios competitivos
- ✅ Integración simple

Contras:
- Requiere setup inicial (~30 min)

**Precio:** Desde $50,000/mes
**Soporte:** Excelente

---

### 2. **FACTURACIÓN.PRO** ⭐⭐⭐⭐

**Página:** https://facturacion.pro/

Pros:
- ✅ Fácil integración
- ✅ Buen precio
- ✅ Interfaz intuitiva

Contras:
- Documentación menos completa que Consigo

**Precio:** Desde $49,000/mes
**Soporte:** Bueno

---

### 3. **DOCU** ⭐⭐⭐⭐

**Página:** https://docu.cl/

Pros:
- ✅ Completo
- ✅ Múltiples documentos (boleta, factura, guía)

**Precio:** Desde $70,000/mes
**Soporte:** Bueno

---

### 4. **ULTRAFE** ⭐⭐⭐

**Página:** https://www.ultrafe.cl/

Pros:
- ✅ Especializado en boleta electrónica
- ✅ Muy estable

**Precio:** Desde $60,000/mes
**Soporte:** Aceptable

---

## 🎯 PASO A PASO: Integrar Consigo

### Paso 1: Registro (15 min)

1. Ir a https://www.consigo.cl/
2. Registrar clínica con RUT
3. Crear cuenta
4. Obtener API Key

### Paso 2: Activar Boleta (10 min)

1. En panel de Consigo
2. Configurar parámetros:
   - RUT de la clínica
   - Nombre comercial
   - Dirección
   - Email
3. Confirmar

### Paso 3: Integración en ArmoniClick (1-2 horas)

1. Crear tabla `sii_configurations` para guardar API Key
2. Crear servicio `SIIIntegrationService`
3. Crear endpoint POST `/api/budgets/{id}/generate-boleta`
4. Crear botón en UI "Generar Boleta SII"
5. Pruebas

### Paso 4: Testing (30 min)

1. Generar boleta de prueba
2. Validar en panel de Consigo
3. Verificar PDF
4. Probar envío por email

---

## 💰 COSTOS COMPARATIVOS

```
OPCIÓN 1: Solo ArmoniClick (Sin SII)
Costo/año: $0 (solo desarrollo ya hecho)
Legalidad: ❌ NO VÁLIDA (requiere boleta SII)
Multa: Hasta $50,000,000 CLP si te auditan

OPCIÓN 2: Software Autorizado (Recomendado)
Costo/año: $600,000 - $2,400,000 CLP
Legalidad: ✅ COMPLETAMENTE LEGAL
Multa: $0 (cumples norma)
Esfuerzo: 2-3 horas integración

OPCIÓN 3: Desarrollo Propio
Costo Inicial: $3,000,000 - $8,000,000 CLP
Costo/año: $200,000 - $500,000 (mantenimiento)
Legalidad: ✅ Legal (si se aprueba)
Multa: Millonaria si hay error
Esfuerzo: 4-8 semanas desarrollo
Riesgo: MUY ALTO
```

---

## ⚠️ MULTAS Y SANCIONES DEL SII

Si no emites boleta legalmente:

- **Omisión de boleta:** $5,000,000 - $50,000,000 CLP
- **Boleta incorrecta:** $2,000,000 - $10,000,000 CLP
- **No registrar en SII:** $10,000,000 - $50,000,000 CLP
- **Error en datos:** $1,000,000 - $5,000,000 CLP
- **Retraso en emisión:** $500,000 - $2,000,000 CLP

**Acción del SII:**
- Inspecciones sorpresa
- Auditorías aleatorias
- Clausura temporal (en casos graves)

---

## ✅ RECOMENDACIÓN FINAL

### PARA AHORA (FASE 1):

Mantén tu sistema de facturas PDF manual:
- Generas PDFs con datos del presupuesto
- Guardas en BD como "factura provisional"
- No las vinculás al SII (todavía)
- **Costo:** $0
- **Riesgo:** Bajo (es solo un documento, no una boleta legal)

### PARA EL PRÓXIMO TRIMESTRE (FASE 2):

Integra Consigo:
- Toda boleta que generes → Pasa automáticamente al SII
- Recibes PDF firmado legalmente
- Cumples normativa SII
- **Costo:** ~$1,200,000 CLP/año
- **Riesgo:** Cero (Consigo se encarga)

### CÓDIGO CAMBIOS NECESARIOS:

Crear archivo: `netlify/services/sii-integration.service.ts`
Crear endpoint: `POST /api/budgets/{id}/generate-sii-boleta`
Actualizar BD: Agregar columna `sii_reference` en invoices

---

## 📞 CONTACTOS IMPORTANTES

**SII (Servicio de Impuestos Internos):**
- Web: https://www.sii.cl/
- Boleta Electrónica: https://www.sii.cl/preguntas-frecuentes-boleta-electronica
- Teléfono: 227821100

**Consigo (Software Recomendado):**
- Web: https://www.consigo.cl/
- Soporte: support@consigo.cl
- Documentación: https://api.consigo.cl/docs

---

## 🎯 CONCLUSIÓN

### ¿Es difícil?

**Sí, el SII es complejo.** Pero hay dos caminos:

1. **Usar software autorizado** (RECOMENDADO)
   - Fácil (⭐)
   - Rápido (2-3 horas)
   - Seguro (sin riesgo legal)
   - Costo: $1,200,000/año

2. **Desarrollar propio** (NO RECOMENDADO)
   - Difícil (⭐⭐⭐⭐⭐)
   - Lento (4-8 semanas)
   - Arriesgado (alto riesgo legal/multas)
   - Costo: $3M-$8M + mantenimiento

### MI CONSEJO:

✅ **Usa Consigo o Facturación.pro**
- Es legítimo
- Es simple
- Es seguro
- Luego puedes cambiar si quieres

❌ **NO desarrolles tu propia integración con SII**
- Muy arriesgado
- Muy complejo
- Muy caro
- Las multas son millonarias

---

## 📚 ARCHIVOS A CREAR (OPCIÓN CONSIGO)

```
netlify/services/
├── sii-integration.service.ts (NUEVO)
│   ├── generateBoleta()
│   ├── getBoleteStatus()
│   └── sendBoleteaByEmail()

netlify/functions/budgets/use-cases/
├── generate-sii-boleta.ts (NUEVO)

src/presentation/hooks/budgets/
├── useSIIBoleta.ts (NUEVO)

src/presentation/pages/budget/
├── GenerateBoleteButton.tsx (NUEVO)
```

---

¿Preguntas sobre SII o integración? 🚀
