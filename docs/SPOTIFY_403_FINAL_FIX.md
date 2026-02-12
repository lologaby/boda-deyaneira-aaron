# Solución Final para Error 403 al Agregar Tracks

## Problema Persistente

Aunque eres el dueño de la playlist y has regenerado el refresh token, sigues recibiendo 403 al intentar agregar tracks.

## Causa Más Probable: Scopes No Preservados en Refresh Token

Hay un problema conocido con Spotify donde los refresh tokens a veces no preservan correctamente los scopes originales, especialmente `playlist-modify-public` y `playlist-modify-private`.

## Solución: Re-autorizar con show_dialog=true

### Paso 1: Re-autorizar la Aplicación

1. Ve a: `https://bodaenelsunset.com/api/spotify-auth?setup=true`
2. **IMPORTANTE**: Cuando Spotify te pida autorización, asegúrate de:
   - Ver la pantalla de permisos que muestra los scopes
   - Aceptar TODOS los permisos solicitados
   - No cancelar ni rechazar ningún permiso
3. Copia el nuevo refresh token

### Paso 2: Verificar que los Scopes se Solicitaron

Durante la autorización, deberías ver una pantalla de Spotify que dice algo como:
- "This app wants to:"
  - ✅ Modify your public playlists
  - ✅ Modify your private playlists
  - ✅ Access your private playlists

Si NO ves esta pantalla o rechazaste algún permiso, los scopes no se aplicaron correctamente.

### Paso 3: Actualizar el Token

1. Ve a Vercel → Settings → Environment Variables
2. Actualiza `SPOTIFY_REFRESH_TOKEN` con el nuevo token
3. Guarda los cambios
4. Espera 2-3 minutos

### Paso 4: Verificar

Prueba de nuevo:
```
https://bodaenelsunset.com/api/spotify-test-playlist
```

## Alternativa: Verificar Scopes en el Código

Si el problema persiste, podemos agregar código para verificar qué scopes tiene el token actual. Sin embargo, Spotify no proporciona una forma directa de verificar los scopes de un token, así que la mejor solución es re-autorizar.

## Checklist Final

- [ ] Estás agregado a la lista de usuarios en Spotify Dashboard
- [ ] Re-autorizaste la app con `show_dialog=true` (ver la pantalla de permisos)
- [ ] Aceptaste TODOS los permisos solicitados
- [ ] Regeneraste el refresh token DESPUÉS de agregarte a la lista de usuarios
- [ ] Actualizaste el token en Vercel
- [ ] Esperaste al menos 5 minutos después de todos los cambios

## Si Nada Funciona

Si después de todos estos pasos sigue fallando, considera:

1. **Solicitar Extended Quota Mode**: Esto elimina la necesidad de agregar usuarios manualmente
2. **Usar una cuenta diferente**: Crea una nueva cuenta de Spotify solo para la app
3. **Contactar Soporte de Spotify**: Puede ser un bug específico de tu cuenta/app

## Nota Técnica

El problema de scopes en refresh tokens es un bug conocido de Spotify que afecta a algunos desarrolladores. La solución más confiable es re-autorizar completamente la aplicación cuando cambias la configuración de usuarios o scopes.
