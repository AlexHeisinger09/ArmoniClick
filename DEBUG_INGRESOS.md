# 🐛 DEBUG: Ingresos Mensuales - Guía de Troubleshooting

## Pasos para Debuggear

### 1. Abre la Consola del Navegador
- Presiona **F12** o **Ctrl+Shift+I** (Windows) o **Cmd+Option+I** (Mac)
- Ve a la pestaña **Console**

### 2. Recarga el Dashboard
- Presiona **F5** o **Ctrl+R** para recargar la página
- Ve a `/dashboard` si no estás allí

### 3. Busca los Logs
Deberías ver logs como estos:

```
📊 useMonthlyRevenueHistory - Presupuestos recibidos: {total: 5, datos: [...]}
📅 Meses inicializados: [...]
💰 Procesando budget: 5/2024 = $ 150000
✅ Actualizado Jun 2024: $ 150000
📊 Datos finales de ingresos: [...]
```

---

## Posibles Problemas y Soluciones

### ❌ Problema 1: "Presupuestos recibidos: {total: 0}"
**Significa:** El endpoint `/budgets/completed` no está devolviendo datos

**Soluciones:**
1. Verifica que hay presupuestos con status = 'completed' en la BD
2. Abre DevTools → Network → Busca la petición `GET /budgets/completed`
3. Verifica el Response: ¿Tiene budgets vacío?

### ❌ Problema 2: "Fecha inválida: undefined"
**Significa:** Los presupuestos no tienen `updated_at` o `created_at`

**Soluciones:**
1. En la petición Network, verifica el JSON response
2. Los presupuestos deben tener estas propiedades

### ❌ Problema 3: "Monto inválido: undefined"
**Significa:** Los presupuestos no tienen `total_amount`

**Soluciones:**
1. Verifica el JSON de la respuesta del endpoint
2. Asegúrate que `total_amount` es string o number

### ❌ Problema 4: "No se encontró mes para X/2024"
**Significa:** El presupuesto tiene fecha pero no coincide con el rango de 12 meses

**Ejemplo:**
- Hoy es 28 de octubre de 2024 (Mes 9)
- El rango calculado es: Oct 2023 → Oct 2024
- Un presupuesto de enero 2023 NO entrará en el rango

**Solución:** Los presupuestos deben estar en los últimos 12 meses

---

## Formato Esperado de Response

El endpoint `/budgets/completed` debe retornar:

```json
{
  "budgets": [
    {
      "id": 1,
      "patient_id": 10,
      "user_id": 5,
      "total_amount": "150000",
      "status": "completed",
      "budget_type": "estetica",
      "created_at": "2024-10-15",
      "updated_at": "2024-10-20",
      "items": [...]
    },
    {
      "id": 2,
      "patient_id": 20,
      "user_id": 5,
      "total_amount": "250000",
      "status": "completed",
      "created_at": "2024-09-10",
      "updated_at": "2024-09-25",
      "items": [...]
    }
  ],
  "count": 2
}
```

### Propiedades Críticas:
- ✅ `total_amount`: String o number (será parseado a float)
- ✅ `updated_at` o `created_at`: String ISO o Date (será parseado con new Date())
- ✅ `status`: "completed" (el endpoint ya lo filtra)

---

## SQL Query Equivalente

Si quieres verificar directamente en tu BD:

```sql
SELECT
  budgets.id,
  budgets.patient_id,
  budgets.total_amount,
  budgets.status,
  budgets.created_at,
  budgets.updated_at
FROM budgets
WHERE budgets.status = 'completed'
  AND budgets.user_id = ?  -- ID del doctor
ORDER BY budgets.updated_at DESC;
```

---

## Network Request

En DevTools → Network busca esta petición:

```
GET /budgets/completed
Status: 200 OK
Response: { "budgets": [...], "count": N }
```

Si ves **404** o **500**, el endpoint tiene problemas en el backend.

---

## Logs Esperados en Consola

**Si todo funciona correctamente:**
```
📊 useMonthlyRevenueHistory - Presupuestos recibidos: {total: 3, datos: Array(3)}
📅 Meses inicializados: [
  {name: 'Oct', monthNumber: 9, year: 2023, ingresos: 0},
  {name: 'Nov', monthNumber: 10, year: 2023, ingresos: 0},
  ...
  {name: 'Oct', monthNumber: 9, year: 2024, ingresos: 0}
]
💰 Procesando budget: 10/2024 = $ 150000
✅ Actualizado Nov 2024: $ 150000
💰 Procesando budget: 9/2024 = $ 250000
✅ Actualizado Oct 2024: $ 250000
📊 Datos finales de ingresos: [
  {name: 'Oct', ingresos: 250000, ...},
  {name: 'Nov', ingresos: 150000, ...},
  ...
]
```

---

## Checklist de Debugging

- [ ] ¿Hay presupuestos con status = 'completed' en la BD?
- [ ] ¿El endpoint `/budgets/completed` retorna 200 OK?
- [ ] ¿Tiene data la respuesta? ({budgets: [...], count: N})
- [ ] ¿Tienen `total_amount` los presupuestos?
- [ ] ¿Tienen `updated_at` o `created_at` los presupuestos?
- [ ] ¿Las fechas están en los últimos 12 meses?
- [ ] ¿El console.log muestra "Datos finales de ingresos"?

---

## Para Reportar el Problema

Comparte los siguientes datos:

1. **Logs de Consola:** Copia los logs que veas en la consola
2. **Network Response:** La respuesta JSON de `/budgets/completed`
3. **Presupuestos en BD:** Los primeros 3 presupuestos completados

Esto permitirá identificar exactamente dónde está el problema.
