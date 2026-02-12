# Integración de Spotify - Configuración

Esta guía explica cómo configurar la integración automática de Spotify para que las canciones solicitadas en el RSVP se agreguen automáticamente a tu playlist.

---

## Resumen

**¿Qué hace esta integración?**
- Cuando un invitado confirma su asistencia y pide una canción, **automáticamente** se agrega a tu playlist de Spotify
- Puedes **migrar** canciones existentes de Notion (de RSVPs anteriores) a la playlist
- Usa búsqueda **real de Spotify** para encontrar canciones (ya no Deezer)

**Credenciales que ya tienes:**
- Client ID: `63358438f35945c7b5cf05f1cd60aa9f`
- Client Secret: `1d6606f97ba743fdaf12c2c5d8df63f4`
- Playlist ID: `3v2Zl4aSJgAPMlkxv9FZzS`

---

## Paso 1: Obtener el Refresh Token

El refresh token es necesario para que la aplicación pueda agregar canciones a tu playlist sin que tengas que autorizar cada vez.

### 1.1 Asegúrate de tener acceso de edición a la playlist

**Importante:** Debes ser el **dueño** de la playlist o tener **permisos de colaborador** con acceso de escritura.

- Si eres el dueño: ✅ listo
- Si no: pídele al dueño que te agregue como colaborador con permisos de edición

### 1.2 Configura las variables de entorno en Vercel (temporalmente)

En tu proyecto de Vercel → Settings → Environment Variables, agrega **temporalmente**:

```
SPOTIFY_CLIENT_ID=63358438f35945c7b5cf05f1cd60aa9f
SPOTIFY_CLIENT_SECRET=1d6606f97ba743fdaf12c2c5d8df63f4
```

### 1.3 Despliega para que el endpoint esté disponible

```bash
git add .
git commit -m "Add Spotify integration endpoints"
git push origin main
```

Espera a que Vercel termine el deploy.

### 1.4 Visita el endpoint de autorización

Abre en tu navegador:

```
https://bodaenelsunset.com/api/spotify-auth?setup=true
```

Esto te llevará a una página con un botón **"Authorize Spotify"**.

### 1.5 Autoriza la aplicación

1. Click en "Authorize Spotify"
2. Inicia sesión con la **cuenta de Spotify que tiene acceso a la playlist**
3. Acepta los permisos que solicita la app
4. Serás redirigido de vuelta con un código en la URL

### 1.6 Obtén el Refresh Token

Después de autorizar, la página te mostrará el **Refresh Token**.

**Guárdalo inmediatamente** - se ve algo así:

```
AQD8j3kl2m...muy largo...x9z
```

---

## Paso 2: Configurar Variables de Entorno en Vercel

En tu proyecto de Vercel → Settings → Environment Variables, agrega:

| Variable | Valor |
|----------|-------|
| `SPOTIFY_CLIENT_ID` | `63358438f35945c7b5cf05f1cd60aa9f` |
| `SPOTIFY_CLIENT_SECRET` | `1d6606f97ba743fdaf12c2c5d8df63f4` |
| `SPOTIFY_REFRESH_TOKEN` | El token largo que obtuviste en el paso anterior |
| `SPOTIFY_PLAYLIST_ID` | `3v2Zl4aSJgAPMlkxv9FZzS` |
| `SPOTIFY_REDIRECT_URI` | `https://bodaenelsunset.com/api/spotify-auth` |

**Importante:** Asegúrate de agregar estas variables para **todos los entornos** (Production, Preview, Development) si quieres que funcione en todos lados.

---

## Paso 3: Redesplegar

Después de agregar las variables, haz un nuevo deploy:

```bash
git commit --allow-empty -m "Trigger redeploy with Spotify env vars"
git push origin main
```

---

## Paso 4: Migrar Canciones Existentes de Notion (Opcional)

Si ya tienes RSVPs confirmados en Notion con canciones, puedes migrarlas a Spotify de una sola vez.

### 4.1 Verifica que la base de datos de Notion tenga la propiedad correcta

La base de datos de invitados debe tener:
- Propiedad **"Attendance"** (select) con opción "Yes"
- Propiedad **"Song Request"** (o "Song" o "Cancion") con texto de la canción

### 4.2 Llama al endpoint de migración

Usa Postman, curl, o el navegador:

**Usando curl:**
```bash
curl -X POST https://bodaenelsunset.com/api/spotify-migrate-notion
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Migration complete",
  "total": 15,
  "added": 13,
  "failed": 2,
  "failedSongs": ["Canción que no encontró", "Otra canción"]
}
```

### 4.3 Revisa la playlist

Ve a tu playlist de Spotify y verifica que las canciones se hayan agregado.

**Nota:** Las canciones que no se encuentren en Spotify (typos, canciones muy oscuras, etc.) aparecerán en `failedSongs`. Puedes agregarlas manualmente si quieres.

---

## Paso 5: Probar la Integración

1. Ve a la web en un navegador privado/incognito
2. Ingresa el código de invitado
3. Llena el RSVP y pide una canción
4. Confirma asistencia
5. Ve a tu playlist de Spotify - la canción debería estar ahí en unos segundos

---

## Cómo Funciona (Técnico)

### Flujo de RSVP:
1. Usuario busca canción → llama a `/api/spotify` (ahora usa API real de Spotify)
2. Usuario selecciona canción → se guarda el `spotifyId`
3. Usuario confirma → llama a `/api/spotify-add-track` con el `spotifyId`
4. El backend usa el refresh token para obtener un access token
5. Agrega la canción a la playlist usando Spotify API

### APIs creadas:
- **`/api/spotify`** - Búsqueda de canciones (modificado para usar Spotify real)
- **`/api/spotify-auth`** - Obtener refresh token (one-time setup)
- **`/api/spotify-add-track`** - Agregar canción a playlist (llamado en cada RSVP)
- **`/api/spotify-migrate-notion`** - Migrar canciones existentes (one-time)

### Seguridad:
- El `SPOTIFY_CLIENT_SECRET` y `SPOTIFY_REFRESH_TOKEN` **nunca** se exponen al cliente
- Solo existen en el backend (Vercel serverless functions)
- El refresh token puede agregarse/revocarse en cualquier momento desde tu cuenta de Spotify

---

## Troubleshooting

### Error: "Spotify not configured"
- Verifica que todas las variables de entorno estén configuradas en Vercel
- Redespliega después de agregar las variables

### Error: "Failed to add track"
- Verifica que tengas permisos de edición en la playlist
- Verifica que el `SPOTIFY_PLAYLIST_ID` sea correcto
- El refresh token puede haber expirado - reautoriza visitando `/api/spotify-auth?setup=true`

### Las canciones no aparecen en la playlist
- Verifica que el `spotifyId` esté presente en los resultados de búsqueda
- Revisa los logs de Vercel (Deployment → Functions) para ver errores

### "Failed songs" en la migración
- Canciones con typos o nombres muy genéricos pueden no encontrarse
- Puedes buscarlas manualmente en Spotify y agregarlas
- O pedirle al invitado que la pida de nuevo con mejor formato

---

## Contacto

Si tienes problemas con la configuración, revisa:
1. Los logs de Vercel (Deployment → Functions → Runtime Logs)
2. La consola del navegador (F12) para errores del cliente
3. Que todas las variables estén configuradas correctamente

---

## Revocación de Acceso

Si en algún momento quieres revocar el acceso:

1. Ve a [tu cuenta de Spotify](https://www.spotify.com/account/apps/)
2. Busca la app "Boda Deyaneira & Aaron" (o como la hayas nombrado)
3. Click en "REMOVE ACCESS"

El refresh token dejará de funcionar y necesitarás reautorizar para volver a usar la integración.
