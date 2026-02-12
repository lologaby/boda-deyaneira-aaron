# Solución Completa para Error 403 de Spotify

## Problema
Estás recibiendo errores `403: Check settings on developer.spotify.com/dashboard, the user may not be registered` incluso después de agregar usuarios.

## Requisitos Críticos (Según Documentación Oficial)

### 1. **El App Owner DEBE tener Spotify Premium**
   - ⚠️ **CRÍTICO**: Apps en development mode **NO funcionan** si el app owner no tiene Premium
   - Verifica que la cuenta que creó la app tenga Premium activo
   - Si no tienes Premium, esta es probablemente la causa del problema

### 2. **Agregar Usuarios Correctamente**
   Según la documentación oficial, debes agregar usuarios así:
   
   1. Ve a https://developer.spotify.com/dashboard
   2. Selecciona tu app
   3. Haz clic en **"Settings"**
   4. Ve a la pestaña **"Users Management"** (no solo "Users and Access")
   5. Haz clic en **"Add new user"**
   6. **IMPORTANTE**: Ingresa **AMBOS**:
      - **Nombre completo** (real name) - debe coincidir exactamente con el nombre en Spotify
      - **Email de Spotify** - el email asociado a la cuenta de Spotify
   7. Guarda los cambios
   8. Espera **hasta 10 minutos** para que los cambios se propaguen

### 3. **Verificar el Email Correcto**
   - Si el usuario inició sesión con **Facebook**, usa su **email de Facebook**
   - Si el usuario inició sesión con **Google**, usa su **email de Google**
   - El email debe ser el que aparece en el perfil de Spotify del usuario

### 4. **Client Credentials vs Refresh Token**
   
   **Client Credentials Flow:**
   - NO requiere usuarios agregados
   - Solo requiere que el **app owner tenga Premium**
   - Funciona para búsquedas públicas
   
   **Refresh Token (Authorization Code Flow):**
   - Requiere que el usuario esté en la lista de usuarios
   - Requiere que el usuario haya autorizado la app
   - Funciona para operaciones que requieren permisos de usuario (como agregar a playlist)

## Soluciones Paso a Paso

### Solución 1: Verificar Premium del App Owner
1. Ve a tu cuenta de Spotify
2. Verifica que tengas **Spotify Premium activo**
3. Si no tienes Premium, esta es la causa del problema
4. Activa Premium y espera unos minutos

### Solución 2: Agregar Usuario Correctamente
1. Ve a https://developer.spotify.com/dashboard
2. Selecciona tu app → **Settings**
3. Ve a **"Users Management"** (pestaña específica)
4. Haz clic en **"Add new user"**
5. Ingresa:
   - **Name**: El nombre completo que aparece en el perfil de Spotify
   - **Email**: El email exacto de la cuenta de Spotify
6. Guarda
7. Espera **10 minutos**
8. Prueba de nuevo

### Solución 3: Verificar que el Usuario Esté Agregado
1. En **Users Management**, verifica que el usuario aparezca en la lista
2. Si aparece, verifica que el email sea exactamente el correcto
3. Si no aparece, agrégala de nuevo

### Solución 4: Usar Client Credentials para Búsquedas
Si el app owner tiene Premium, Client Credentials debería funcionar sin usuarios agregados:
- El código ya está configurado para usar Client Credentials primero
- Si sigue fallando, el problema es que el app owner no tiene Premium

### Solución 5: Solicitar Extended Quota Mode (Solo Organizaciones)
⚠️ **Nota**: Desde mayo 2025, Extended Quota Mode solo está disponible para:
- Organizaciones (no individuos)
- Empresas legalmente registradas
- Servicios con al menos 250k usuarios activos mensuales
- Disponibilidad en mercados clave de Spotify

Si cumples estos requisitos:
1. Ve a Settings → **Quota extension Request**
2. Completa el cuestionario (4 pasos)
3. Envía la solicitud
4. El proceso puede tardar hasta 6 semanas

## Diagnóstico

Usa el endpoint de diagnóstico para verificar qué está funcionando:
```
https://bodaenelsunset.com/api/spotify-diagnose
```

Interpretación:
- ✅ **Client Credentials funciona**: El app owner tiene Premium y la app está configurada correctamente
- ❌ **Client Credentials falla**: El app owner NO tiene Premium (solución: activar Premium)
- ✅ **Refresh Token funciona**: El usuario está correctamente agregado
- ❌ **Refresh Token falla**: El usuario no está agregado o el email/nombre no coincide

## Checklist Final

- [ ] App owner tiene Spotify Premium activo
- [ ] Usuario agregado en "Users Management" (no solo "Users and Access")
- [ ] Nombre completo ingresado (coincide con perfil de Spotify)
- [ ] Email correcto ingresado (el mismo que usa para iniciar sesión)
- [ ] Esperado al menos 10 minutos después de agregar usuario
- [ ] Verificado que el usuario aparece en la lista de usuarios

## Si Nada Funciona

1. **Verifica Premium**: Esta es la causa más común
2. **Contacta Soporte**: https://community.spotify.com/t5/Spotify-for-Developers/bd-p/Spotify_Developer
3. **Considera usar solo Client Credentials**: Si solo necesitas búsquedas, Client Credentials debería funcionar con Premium
