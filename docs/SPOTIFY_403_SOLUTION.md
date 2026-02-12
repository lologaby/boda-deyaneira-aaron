# Solución para Error 403 de Spotify

## Problema
Estás recibiendo errores `403: Check settings on developer.spotify.com/dashboard, the user may not be registered` cuando intentas buscar canciones o migrar a Spotify.

## Causa
Tu app de Spotify está en modo **Development** y necesita tener usuarios agregados explícitamente, o necesitas solicitar **Extended Quota Mode**.

## Solución Rápida (Recomendada)

### Opción 1: Agregar Usuarios a la App (5 minutos)

1. Ve a https://developer.spotify.com/dashboard
2. Selecciona tu app
3. Haz clic en **"Edit Settings"**
4. En la sección **"Users and Access"**, haz clic en **"Add New User"**
5. Agrega el email de la cuenta de Spotify que usaste para autorizar la app (la que generó el refresh token)
6. Guarda los cambios
7. Espera 1-2 minutos para que los cambios se propaguen
8. Prueba de nuevo la migración

### Opción 2: Solicitar Extended Quota Mode (Puede tardar días)

1. Ve a https://developer.spotify.com/dashboard
2. Selecciona tu app
3. Haz clic en **"Edit Settings"**
4. Busca la opción **"Extended Quota Mode"** o **"Request Extended Quota"**
5. Completa el formulario explicando que necesitas acceso para una app de boda que busca canciones
6. Espera la aprobación (puede tardar varios días)

## Verificar que Funciona

Después de agregar usuarios, prueba el endpoint de diagnóstico:

```
https://bodaenelsunset.com/api/spotify-diagnose
```

Deberías ver que ambos tokens funcionan correctamente.

## Nota Técnica

El refresh token debería funcionar sin restricciones, pero Spotify está rechazando las búsquedas porque la app está en modo Development sin usuarios agregados. Una vez que agregues usuarios, tanto el Client Credentials como el Refresh Token deberían funcionar.
