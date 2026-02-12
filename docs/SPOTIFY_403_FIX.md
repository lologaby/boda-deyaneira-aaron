# Fix Spotify 403 Error: "User may not be registered"

## El Problema

Estás recibiendo este error:
```
API error 403: Check settings on developer.spotify.com/dashboard, the user may not be registered.
```

Esto significa que tu aplicación de Spotify está en modo **Development** y necesita tener usuarios agregados para poder usar la API de búsqueda.

## Solución Rápida

### Opción 1: Agregar Usuarios a la App (Recomendado)

1. Ve a https://developer.spotify.com/dashboard
2. Click en tu app (Client ID: `e9f1bea3e7eb4e2fb8c6d153617f355f`)
3. Click en **"Edit Settings"**
4. Scroll hasta **"Users"** o **"User Management"**
5. Click en **"Add New User"**
6. Agrega tu email de Spotify (el que usaste para autorizar)
7. Guarda los cambios
8. Espera 1-2 minutos y prueba de nuevo

### Opción 2: Solicitar Extended Quota Mode

Si quieres que la app funcione sin agregar usuarios específicos:

1. Ve a https://developer.spotify.com/dashboard
2. Click en tu app
3. Busca **"Request Extended Quota Mode"** o **"Request Quota Extension"**
4. Completa el formulario explicando que es para una boda/evento
5. Espera aprobación (puede tomar días)

### Opción 3: Usar el mismo token de usuario para búsqueda

Podemos modificar el código para usar el refresh token también para búsquedas (no solo para agregar a playlist). Esto evita el problema del 403.

## Verificar que Funciona

Después de agregar usuarios, prueba:

```
https://bodaenelsunset.com/api/spotify-test?q=Mil+Mujeres+Rauw+Alejandro
```

Deberías ver resultados en lugar del error 403.

## Nota Importante

El flujo de **Client Credentials** (que usamos para búsquedas) tiene restricciones en modo Development:
- Solo funciona para usuarios agregados explícitamente a la app
- Tiene límites de rate (requests por segundo)
- No requiere OAuth del usuario final (por eso lo usamos)

El flujo de **Refresh Token** (que usamos para agregar a playlist) funciona porque ya autorizaste la app con tu cuenta.
