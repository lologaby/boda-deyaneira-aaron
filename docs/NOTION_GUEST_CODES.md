# Códigos de invitado (Notion) — una sola vez

Los códigos de acceso (ej. `test123`) se validan contra una base de datos en Notion.

## Si ves "404: NOT_FOUND" al entrar el código

Ese mensaje es de **Vercel**: la ruta `/api/guest` no existe en el despliegue. Revisa:

1. **Vercel → tu proyecto → Settings → General → Root Directory**  
   Debe estar **vacío** (o `.`). Si pone una carpeta (ej. `app` o `frontend`), la carpeta `api/` puede quedar fuera y las rutas `/api/*` devuelven 404.

2. **Despliegue**  
   Asegúrate de desplegar desde la rama que tiene la carpeta `api/` en la raíz del repo (con `api/guest.ts`, `api/guest-check.ts`, etc.).

3. **Probar el diagnóstico**  
   Abre `https://www.bodaenelsunset.com/api/guest-check`.  
   - Si sigue 404: el problema es el punto 1 o 2.  
   - Si responde JSON: la API está bien; usa el mensaje para revisar Notion. Esto solo hay que configurarlo **una vez**. Si más adelante los códigos dejan de funcionar, usa el diagnóstico abajo.

## Configuración inicial (una vez)

1. **Integración en Notion**
   - Entra en [notion.so/my-integrations](https://www.notion.so/my-integrations).
   - Crea una integración (o usa una que ya tengas).
   - Copia el **Secret** (empieza por `secret_`).

2. **Variables en Vercel**
   - En tu proyecto de Vercel: **Settings → Environment Variables**.
   - Añade:
     - `NOTION_API_KEY` = el Secret de la integración.
     - `NOTION_GUESTS_DATABASE_ID` = ID de la base de invitados (en la URL de Notion: `notion.so/[ESTE_ID]?v=...`).
   - Guarda y redeploy si hace falta.

3. **Conectar la base con la integración**
   - En Notion, abre la **base de datos de invitados**.
   - Arriba a la derecha: **⋯** (o "Add connections").
   - Elige tu integración y conéctala.
   - Sin este paso la API no puede leer la base y todos los códigos saldrán inválidos.

4. **Estructura de la base**
   - Debe haber una propiedad de tipo **Texto** llamada exactamente **Code** (el valor es el código que escribe el invitado).

## Si los códigos dejan de funcionar

Abre en el navegador (cambia el dominio por el tuyo):

**https://www.bodaenelsunset.com/api/guest-check**

Ahí verás:
- Si falta `NOTION_API_KEY` o `NOTION_GUESTS_DATABASE_ID`.
- Si la API key es incorrecta (401).
- Si la base no existe o no está compartida con la integración (404/403).

Sigue el mensaje y el **nextStep** que salga en la respuesta. Lo más habitual es que la base se haya desconectado de la integración (por ejemplo tras moverla o duplicarla); en ese caso vuelve a **Add connections** en esa base y selecciona la misma integración.
