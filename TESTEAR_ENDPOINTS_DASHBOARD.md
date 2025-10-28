# Testing Dashboard Endpoints

## Endpoints nuevos para el Dashboard

### 1. Tratamientos Populares
**Endpoint:** `GET /treatments/popular`
**Ruta:** `http://localhost:8888/.netlify/functions/treatments/popular`

**Requiere:** JWT token en header `Authorization: Bearer <token>`

**Respuesta esperada:**
```json
{
  "success": true,
  "data": [
    {
      "nombre_servicio": "Limpieza",
      "frecuencia": 5
    },
    {
      "nombre_servicio": "Relleno",
      "frecuencia": 3
    }
  ]
}
```

**Problemas si no funciona:**
- No hay treatments activos (`is_active = true`)
- No hay treatments para el doctor actual
- JWT token es inválido

### 2. Ingresos por Treatments Completados
**Endpoint:** `GET /budgets/revenue-treatments`
**Ruta:** `http://localhost:8888/.netlify/functions/budgets`

**Requiere:** JWT token en header `Authorization: Bearer <token>`

**Respuesta esperada:**
```json
{
  "budgets": [
    {
      "id": 1,
      "patient_id": 5,
      "user_id": 1,
      "total_amount": "500000",
      "status": "ACTIVATED",
      "created_at": "2024-10-15T10:30:00Z",
      "items": [
        {
          "id": 10,
          "accion": "Limpieza",
          "valor": "250000",
          "created_at": "2024-10-20T14:45:00Z"
        }
      ]
    }
  ]
}
```

**Problemas si no funciona:**
- No hay presupuestos activados (`status = ACTIVATED`)
- No hay treatments con `status = 'completed'`
- El presupuesto no tiene items con treatments asociados

## Debugging Checklist

### Base de datos
- [ ] ¿Existen treatments en la tabla `treatments`?
  ```sql
  SELECT COUNT(*) FROM treatments WHERE id_doctor = ? AND is_active = true;
  ```

- [ ] ¿Existen presupuestos activados?
  ```sql
  SELECT COUNT(*) FROM budgets WHERE user_id = ? AND status = 'ACTIVATED';
  ```

- [ ] ¿Existen treatments completados?
  ```sql
  SELECT COUNT(*) FROM treatments WHERE status = 'completed';
  ```

- [ ] ¿Están vinculados los items de presupuestos con treatments?
  ```sql
  SELECT bi.id, bi.budget_id, t.id_tratamiento
  FROM budget_items bi
  LEFT JOIN treatments t ON bi.id = t.budget_item_id
  WHERE t.status = 'completed';
  ```

### Frontend Console (F12)
1. Abre DevTools → Console
2. Busca errores que digan:
   - "Error fetching popular treatments"
   - "No se puede obtener ingresos por treatments completados"

3. Abre DevTools → Network
4. Filtra por XHR/Fetch
5. Busca requests a:
   - `/treatments/popular`
   - `/budgets/revenue-treatments`
6. Verifica que retornen status 200 y contienen datos

### Backend Logs
Cuando ejecutes `npm run netlify:dev`, deberías ver logs como:
- `💰 Obteniendo ingresos por treatments completados`
- `🎯 Obteniendo tratamientos populares`
- `✅ Presupuestos con treatments completados: X`

Si no ves estos logs, significa que los endpoints no se están llamando correctamente.

## Soluciones

### Si no hay datos
1. Crea algunos treatments de prueba desde la UI
2. Asegúrate de que estén marcados como `is_active = true`
3. Crea un presupuesto y actívalo
4. Crea items en el presupuesto y vincula treatments completados

### Si los endpoints retornan error 401
- Token expirado: Haz logout y login nuevamente
- Token inválido: Verifica que el token en localStorage es válido

### Si los endpoints retornan error 500
- Revisar logs del servidor para el error exacto
- Verificar que las tablas existen en la BD
- Verificar que las relaciones entre tablas son correctas
