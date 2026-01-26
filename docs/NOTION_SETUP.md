# Configuración de Notion para la Galería de Fotos

Esta guía te explica cómo configurar Notion para que Deyaneira y Aaron puedan subir fotos y escribir mensajes personalizados sin necesidad de tocar código.

## Resumen

Los novios tendrán:
1. **Una página de Notion** - Para escribir su mensaje de agradecimiento
2. **Una base de datos de Notion** - Para subir fotos (como una galería)

El sitio web leerá automáticamente este contenido y lo mostrará en la sección "Después de la boda".

---

## Paso 1: Crear una Integración de Notion

1. Ve a [notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Click en **"+ New integration"**
3. Configura:
   - **Name:** `Boda Deyaneira & Aaron`
   - **Associated workspace:** Tu workspace personal o el de los novios
   - **Type:** Internal
4. Click **"Submit"**
5. Copia el **"Internal Integration Secret"** (empieza con `secret_`)
   - ⚠️ Guárdalo en un lugar seguro, lo necesitarás más adelante

---

## Paso 2: Crear la Página del Mensaje

Los novios escribirán su mensaje de agradecimiento aquí.

1. En Notion, crea una nueva página llamada **"Mensaje de los Novios"**
2. Escribe el mensaje que quieran compartir. Ejemplo:

```
Gracias a todos por hacer de nuestra boda un día inolvidable. 
Cada abrazo, cada baile y cada momento compartido quedará 
grabado en nuestros corazones para siempre.

No podemos creer que ya somos esposos. Este nuevo capítulo
comienza gracias a su amor y apoyo incondicional.

Los amamos,
Deyaneira & Aaron
```

3. **Conecta la integración a la página:**
   - Click en los `...` (tres puntos) arriba a la derecha
   - Click en **"Add connections"**
   - Busca y selecciona **"Boda Deyaneira & Aaron"**
   - Click **"Confirm"**

4. **Obtén el ID de la página:**
   - Click en **"Share"** → **"Copy link"**
   - El link será algo como: `https://www.notion.so/Tu-Mensaje-abc123def456...`
   - El **PAGE_ID** son los últimos 32 caracteres (sin guiones): `abc123def456...`

---

## Paso 3: Crear la Galería de Fotos (Base de Datos)

1. En Notion, crea una nueva página llamada **"Galería de la Boda"**
2. Escribe `/database` y selecciona **"Database - Inline"** o **"Gallery view"**
3. Configura las propiedades de la base de datos:

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `Name` | Title | Título/descripción de la foto |
| `Image` | Files & media | **LA FOTO** (arrastrar y soltar aquí) |
| `Order` | Number | Orden en que aparece (1, 2, 3...) |
| `Caption` | Text | Descripción opcional para mostrar |

4. **Conecta la integración:**
   - Click en los `...` de la base de datos
   - **"Add connections"** → **"Boda Deyaneira & Aaron"** → **"Confirm"**

5. **Obtén el ID de la base de datos:**
   - Click en los `...` → **"Copy link"**
   - El link será: `https://www.notion.so/abc123def456?v=...`
   - El **DATABASE_ID** son los 32 caracteres después de `notion.so/` y antes de `?v=`

---

## Paso 4: Subir Fotos a la Galería

¡Esto es lo más fácil! Los novios solo tienen que:

1. Abrir la base de datos "Galería de la Boda"
2. Click en **"+ New"** para añadir una foto
3. En la columna **"Image"**, hacer click y **arrastrar la foto** o click para subirla
4. Escribir un nombre/título en **"Name"**
5. Poner un número en **"Order"** (1 para la primera, 2 para la segunda, etc.)
6. Opcionalmente añadir una descripción en **"Caption"**

**Tip:** Pueden cambiar la vista a "Gallery" para ver las fotos como miniaturas.

---

## Paso 5: Configurar las Variables de Entorno

En Vercel (o tu plataforma de hosting), añade estas variables:

```
NOTION_API_KEY=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_PAGE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### En Vercel:
1. Ve a tu proyecto en [vercel.com](https://vercel.com)
2. Settings → Environment Variables
3. Añade cada variable con su valor
4. Haz un nuevo deploy (o espera al siguiente push)

---

## Uso Diario para los Novios

### Para cambiar el mensaje:
1. Abre la página "Mensaje de los Novios" en Notion
2. Edita el texto
3. ¡Listo! Los cambios aparecen en el sitio en minutos

### Para añadir fotos:
1. Abre la base de datos "Galería de la Boda"
2. Click en "+ New"
3. Sube la foto, ponle nombre y orden
4. ¡Listo! La foto aparece en el sitio

### Para quitar una foto:
1. En la base de datos, encuentra la entrada
2. Click derecho → "Delete"

### Para reordenar fotos:
1. Cambia los números en la columna "Order"
2. Las fotos se reordenan automáticamente

---

## Notas Importantes

### Sobre las fotos en Notion:
- Notion genera URLs temporales para las imágenes (expiran después de 1 hora)
- El sitio cachea las URLs por 5 minutos, así que puede tomar un poco en actualizarse
- Para fotos permanentes, considera usar URLs externas (Google Drive público, Cloudinary, etc.)

### Para usar URLs externas (recomendado para muchas fotos):
1. Sube la foto a Google Drive, Cloudinary, o ImgBB
2. Obtén el link directo a la imagen
3. En la propiedad "Image" de Notion, pega el link como "Link to file"

### Límites:
- El plan gratuito de Notion permite subir archivos de hasta 5MB cada uno
- No hay límite de cantidad de fotos

---

## Solución de Problemas

### "Las fotos no aparecen"
- Verifica que la integración está conectada a la base de datos
- Verifica que las propiedades se llaman exactamente "Image" (o "Foto" o "Photo")
- Verifica que el DATABASE_ID es correcto

### "El mensaje no aparece"
- Verifica que la integración está conectada a la página
- Verifica que el PAGE_ID es correcto
- El mensaje debe ser texto simple (párrafos), no tablas o elementos complejos

### "Error 500 en la API"
- Verifica que el NOTION_API_KEY es correcto y está activo
- Verifica que la integración tiene acceso a las páginas

---

## Estructura Visual

```
Notion Workspace
├── 📄 Mensaje de los Novios (PAGE)
│   └── "Gracias a todos por hacer de nuestra boda..."
│
└── 📊 Galería de la Boda (DATABASE)
    ├── Foto 1: "Primer baile" - Order: 1
    ├── Foto 2: "Cortando el pastel" - Order: 2
    ├── Foto 3: "Con la familia" - Order: 3
    └── ...
```

---

## Contacto

Si tienes problemas con la configuración, contacta a Alex.
