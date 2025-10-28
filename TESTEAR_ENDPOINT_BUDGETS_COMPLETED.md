# 🧪 Cómo Testear el Endpoint `/budgets/completed`

## Opción 1: Usando Postman

### 1. Abre Postman

### 2. Crea una nueva petición

- **Método:** GET
- **URL:** `http://localhost:8888/.netlify/functions/budgets/completed`

### 3. Agrega el Token JWT

En la pestaña **Headers**, agrega:

| Key | Value |
|-----|-------|
| Authorization | Bearer YOUR_JWT_TOKEN |

**¿Dónde obtener el token?**

1. Abre DevTools (F12) en el navegador
2. Ve a **Application** o **Storage**
3. Busca **localStorage**
4. Copia el valor de `token` o `jwt`

Ejemplo:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Click en "Send"

### 5. Mira la Response

**Si todo funciona (200 OK):**
```json
{
  "budgets": [
    {
      "id": 1,
      "patient_id": 10,
      "user_id": 5,
      "total_amount": "150000",
      "status": "completed",
      ...
    }
  ],
  "count": 1
}
```

**Si hay error (404 o 500):**
```json
{
  "message": "Error al obtener presupuestos completados",
  "error": "..."
}
```

---

## Opción 2: Usando cURL (Terminal)

### En Windows (PowerShell o CMD)

```bash
$token = "YOUR_JWT_TOKEN_HERE"
$headers = @{"Authorization" = "Bearer $token"}
$response = Invoke-WebRequest `
  -Uri "http://localhost:8888/.netlify/functions/budgets/completed" `
  -Headers $headers `
  -Method Get

$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

### En Mac/Linux (Terminal)

```bash
curl -X GET "http://localhost:8888/.netlify/functions/budgets/completed" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### Con Pretty Print (JSON formateado)

```bash
curl -X GET "http://localhost:8888/.netlify/functions/budgets/completed" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" | jq '.'
```

---

## Opción 3: Desde el Navegador (DevTools)

### 1. Abre la consola del navegador (F12)

### 2. Ve a la pestaña Console

### 3. Ejecuta este código JavaScript

```javascript
// Obtener el token del localStorage
const token = localStorage.getItem('token');

// Hacer la petición
fetch('http://localhost:8888/.netlify/functions/budgets/completed', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => {
  console.log('Respuesta:', data);
  console.log('Total presupuestos:', data.count);
  console.log('Primer presupuesto:', data.budgets[0]);
})
.catch(error => console.error('Error:', error));
```

### 4. Mira la respuesta en la consola

Deberías ver algo como:
```
Respuesta: {budgets: [...], count: 2}
Total presupuestos: 2
Primer presupuesto: {id: 1, patient_id: 10, ...}
```

---

## Qué Significa Cada Respuesta

### ✅ 200 OK - Todo funciona
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
      "created_at": "2024-10-15T10:30:00Z",
      "updated_at": "2024-10-20T15:45:00Z",
      "doctor_name": "Juan",
      "doctor_lastName": "Pérez",
      "items": [...]
    }
  ],
  "count": 1
}
```

### ✅ 200 OK pero sin datos
```json
{
  "budgets": [],
  "count": 0
}
```

**Significa:** No hay presupuestos completados en la BD
- Crea presupuestos y complétalos

### ❌ 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Token no válido o expirado"
}
```

**Significa:** El token es inválido
- Copia correctamente el token
- Asegúrate de usar Bearer + token

### ❌ 404 Not Found
```
No endpoint found for...
```

**Significa:** El endpoint no existe en el backend
- Verifica que subiste todos los cambios
- Recarga el servidor: `npm run netlify:dev`

### ❌ 500 Internal Server Error
```json
{
  "message": "Error al obtener presupuestos completados",
  "error": "..."
}
```

**Significa:** Error en el backend
- Mira los logs del servidor
- Verifica que la BD está accesible

---

## Checklist de Testeo

- [ ] Netlify dev server está corriendo: `npm run netlify:dev`
- [ ] Estás autenticado (token en localStorage)
- [ ] Obtuve el JWT token correctamente
- [ ] La URL es exacta: `http://localhost:8888/.netlify/functions/budgets/completed`
- [ ] El header Authorization está correcto: `Bearer TOKEN`
- [ ] La respuesta es 200 OK
- [ ] Hay presupuestos en la respuesta (count > 0)

---

## Ejemplo Completo (Postman)

```
GET http://localhost:8888/.netlify/functions/budgets/completed

Headers:
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwiZW1haWwiOiJkb2N0b3JAZXhhbXBsZS5jb20iLCJpYXQiOjE3Mjk3NzE5MzF9.abc123...

Response (200 OK):
{
  "budgets": [
    {
      "id": 1,
      "patient_id": 10,
      "user_id": 5,
      "total_amount": "150000",
      "status": "completed",
      "budget_type": "estetica",
      "created_at": "2024-10-15T10:30:00Z",
      "updated_at": "2024-10-20T15:45:00Z",
      "doctor_name": "Juan",
      "doctor_lastName": "Pérez",
      "items": [
        {
          "id": 101,
          "budget_id": 1,
          "pieza": "Cara",
          "accion": "Botox",
          "valor": "150000",
          "created_at": "2024-10-15T10:30:00Z"
        }
      ]
    }
  ],
  "count": 1
}
```

---

## Troubleshooting

### Problema: "Cannot GET /budgets/completed"

```
GET /budgets/completed 404 Not Found
```

**Solución:**
1. Verifica que la URL es correcta
2. Verifica que el método es GET (no POST)
3. Recarga el servidor: `Ctrl+C` y `npm run netlify:dev`

---

### Problema: "Invalid token"

**Solución:**
1. Abre DevTools (F12)
2. Ve a Console
3. Ejecuta: `console.log(localStorage.getItem('token'))`
4. Copia exactamente ese valor
5. Usa: `Bearer VALOR_QUE_COPIASTE`

---

### Problema: "count: 0" (sin presupuestos)

**Solución:**
```sql
-- Verifica cuántos presupuestos completados hay
SELECT COUNT(*) FROM budgets WHERE status = 'completed';
```

Si es 0:
1. Ve a la app
2. Crea un presupuesto
3. Actívalo
4. Complétalo
5. Testea nuevamente

---

## Token de Ejemplo (para testing)

Si necesitas un token válido sin autenticarte manualmente:

```bash
# En el backend, genera un token de prueba
node -e "
const jwt = require('jsonwebtoken');
const token = jwt.sign(
  { id: 5, email: 'doctor@example.com' },
  'tu_jwt_secret',
  { expiresIn: '24h' }
);
console.log(token);
"
```

Luego úsalo en el header.

---

## ¿Necesitas Ayuda?

Si el endpoint no funciona, reporta:

1. **Status Code:** ¿Qué número devuelve? (200, 404, 500?)
2. **Response:** Copia el JSON completo
3. **Logs del servidor:** ¿Qué dice la terminal de `npm run netlify:dev`?
4. **BD:** Resultado de `SELECT COUNT(*) FROM budgets WHERE status = 'completed';`

Con esto identificaré exactamente el problema.
