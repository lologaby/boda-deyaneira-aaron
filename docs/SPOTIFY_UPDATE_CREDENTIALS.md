# Actualización de Credenciales de Spotify

## ✅ Credenciales Actualizadas

Las siguientes credenciales han sido actualizadas en el código:

- **Client ID**: `63358438f35945c7b5cf05f1cd60aa9f`
- **Client Secret**: `1d6606f97ba743fdaf12c2c5d8df63f4`

## 📋 Próximos Pasos Requeridos

### 1. Actualizar Variables de Entorno en Vercel

1. Ve a tu proyecto en Vercel: https://vercel.com/dashboard
2. Selecciona tu proyecto
3. Ve a **Settings** → **Environment Variables**
4. Actualiza las siguientes variables:
   - `SPOTIFY_CLIENT_ID` → `63358438f35945c7b5cf05f1cd60aa9f`
   - `SPOTIFY_CLIENT_SECRET` → `1d6606f97ba743fdaf12c2c5d8df63f4`
5. **IMPORTANTE**: Haz clic en **"Redeploy"** o espera el próximo deploy para que los cambios surtan efecto

### 2. Generar Nuevo Refresh Token

Como las credenciales cambiaron, necesitas generar un nuevo refresh token con las nuevas credenciales:

1. Ve a: `https://bodaenelsunset.com/api/spotify-auth?setup=true`
2. Esto te redirigirá a Spotify para autorizar la app
3. Autoriza la aplicación
4. Serás redirigido de vuelta y verás el nuevo **Refresh Token**
5. Copia el refresh token

### 3. Actualizar Refresh Token en Vercel

1. En Vercel → Settings → Environment Variables
2. Actualiza `SPOTIFY_REFRESH_TOKEN` con el nuevo token que obtuviste
3. Guarda los cambios
4. Haz **Redeploy** del proyecto

### 4. Verificar que Funciona

Después de actualizar todo, verifica que funciona:

1. **Diagnóstico**: `https://bodaenelsunset.com/api/spotify-diagnose`
   - Deberías ver que Client Credentials funciona (ya que tienes Premium)
   - Refresh Token debería funcionar después de generar el nuevo token

2. **Prueba de búsqueda**: `https://bodaenelsunset.com/api/spotify?q=test`
   - Debería devolver resultados sin errores 403

3. **Migración**: Si tienes canciones en Notion, prueba la migración
   - `https://bodaenelsunset.com/api/spotify-migrate-page`

## ⚠️ Notas Importantes

- **Premium Requerido**: Como tienes Premium, Client Credentials debería funcionar sin problemas
- **Redirect URI**: Asegúrate de que el Redirect URI en Spotify Dashboard sea: `https://bodaenelsunset.com/api/spotify-auth`
- **Espera**: Después de actualizar variables en Vercel, espera unos minutos para que se propaguen los cambios

## 🔍 Si Algo No Funciona

1. Verifica que todas las variables estén actualizadas en Vercel
2. Verifica que el Redirect URI coincida exactamente en Spotify Dashboard
3. Usa el endpoint de diagnóstico para ver qué está fallando
4. Revisa los logs de Vercel para ver errores específicos
