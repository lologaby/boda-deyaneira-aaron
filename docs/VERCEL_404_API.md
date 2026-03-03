# Si /api/guest da 404 NOT_FOUND en Vercel

La app está en Vercel y las variables (API keys) las editas ahí. Si aun así ves **404: NOT_FOUND** al validar el código o al abrir `/api/guest-check`, revisa esto en el dashboard de Vercel.

## 1. Root Directory (lo más habitual)

**Settings → General → Root Directory**

- Tiene que estar **vacío** (o `.`).
- Si pone una carpeta (por ejemplo `app`, `frontend`, `web`), Vercel usa **solo esa carpeta** como raíz. La carpeta **`api/`** está en la raíz del repo; si la raíz del proyecto en Vercel es una subcarpeta, **no ve `api/`** y las rutas `/api/*` devuelven 404.
- Déjalo vacío, guarda y haz **Redeploy** del último deployment.

## 2. Que la carpeta `api/` esté en el repo

En la rama que despliegas (por ejemplo `main`), en la **raíz** del repositorio debe existir la carpeta **`api/`** con archivos como:

- `api/guest.ts`
- `api/guest-check.ts`
- etc.

Si el repo se clonó sin esa carpeta o solo se despliega un subdirectorio, las funciones no existen en el deployment.

## 3. Build y despliegue

- **Settings → General → Build & Development Settings**
  - **Build Command:** `npm run build` (o el que tengas en `vercel.json`).
  - **Output Directory:** `dist`.
- Después de cambiar **Root Directory** o la rama, ve a **Deployments**, abre los tres puntos del último deployment y elige **Redeploy** (sin marcar “Use existing Build Cache” si quieres forzar un build limpio).

## 4. Comprobar que las funciones existen en el deployment

En **Deployments**, abre el último deployment y revisa la pestaña **Functions** (o **Serverless Functions**). Ahí deberían aparecer rutas como:

- `/api/guest`
- `/api/guest-check`
- etc.

Si esa lista está vacía o no sale `/api/guest`, las funciones no se han desplegado; suele ser por **Root Directory** (punto 1) o porque la carpeta `api/` no está en la raíz del código que se despliega.

## 5. Probar sin reescrituras

Abre en el navegador:

- `https://tu-dominio.vercel.app/api/guest-check`

Si ahí **sí** responde JSON (aunque sea con error de Notion), las funciones están bien y el 404 era por otra ruta o por caché. Si también da 404, el problema es que las funciones no se despliegan (vuelve a 1 y 2).

---

Resumen: en la mayoría de casos el 404 se soluciona dejando **Root Directory** vacío y haciendo **Redeploy**.
