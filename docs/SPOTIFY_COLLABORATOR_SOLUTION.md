# Solución para Colaboradores de Playlist

## El Problema

Estás recibiendo un error 403 al intentar agregar canciones a una playlist de Spotify donde eres colaborador, pero no eres el dueño.

## Limitación de Spotify API

**Importante**: La API de Spotify solo permite que el **dueño de la playlist** agregue canciones mediante la API, incluso si eres colaborador y puedes agregar canciones manualmente en la app de Spotify.

Esta es una limitación conocida de la API de Spotify que no se puede evitar.

## Soluciones

### Opción 1: Usar el Refresh Token del Dueño (Recomendado)

El dueño de la playlist (`deyaneiram.19`) debe generar el refresh token:

1. El dueño debe iniciar sesión en Spotify con su cuenta (`deyaneiram.19`)
2. Ir a: `https://bodaenelsunset.com/api/spotify-auth?setup=true`
3. Autorizar la aplicación
4. Copiar el refresh token generado
5. Compartir el refresh token contigo (o actualizarlo directamente en Vercel)
6. Actualizar `SPOTIFY_REFRESH_TOKEN` en Vercel con el token del dueño

**Ventajas:**
- Funciona inmediatamente
- No requiere cambios en la playlist
- Es la solución más simple

**Desventajas:**
- El dueño debe compartir su refresh token (aunque es seguro ya que solo tiene acceso a la playlist específica)

### Opción 2: Transferir la Playlist

Si es posible, el dueño puede transferir la propiedad de la playlist a tu cuenta:

1. El dueño abre la playlist en Spotify
2. Hace clic en los tres puntos → "Transferir propiedad"
3. Transfiere la playlist a tu cuenta
4. Generas el refresh token con tu cuenta
5. Actualizas `SPOTIFY_REFRESH_TOKEN` en Vercel

**Ventajas:**
- Tú tienes control total
- No necesitas compartir tokens

**Desventajas:**
- El dueño pierde la propiedad de la playlist
- Puede no ser deseable si el dueño quiere mantener control

### Opción 3: Crear una Nueva Playlist

Crear una nueva playlist que tú poseas:

1. Crea una nueva playlist en Spotify con tu cuenta
2. Comparte la nueva playlist con el dueño original si es necesario
3. Actualiza `SPOTIFY_PLAYLIST_ID` en Vercel con el ID de la nueva playlist
4. Genera un nuevo refresh token con tu cuenta
5. Actualiza `SPOTIFY_REFRESH_TOKEN` en Vercel

**Ventajas:**
- Tú tienes control total
- No afecta la playlist original

**Desventajas:**
- Las canciones ya agregadas no se migran automáticamente
- Necesitas actualizar el link de la playlist en el sitio web

## Recomendación

**Opción 1** es la más práctica: que el dueño genere el refresh token y lo comparta. El refresh token solo da acceso a modificar esa playlist específica (según los scopes configurados), así que es relativamente seguro.

## Verificar que Funciona

Después de usar el refresh token del dueño, prueba:

```
https://bodaenelsunset.com/api/spotify-test-playlist
```

Deberías ver:
- Token user: `deyaneiram.19` (o el dueño)
- Playlist owner: `deyaneiram.19` (o el dueño)
- Add Track: ✅ success

## Nota de Seguridad

El refresh token solo tiene acceso a:
- Modificar la playlist específica (`playlist-modify-public` o `playlist-modify-private`)
- Leer información de la playlist (`playlist-read-private`)

No tiene acceso a:
- Tu cuenta completa de Spotify
- Otras playlists
- Información personal fuera de la playlist

Por lo tanto, compartir el refresh token del dueño es relativamente seguro para este caso de uso específico.
