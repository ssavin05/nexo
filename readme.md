# Nexo v19 — Prototipo Final

Versión cerrada para validación funcional, visual y comercial.

## Cómo funciona
- No usa backend.
- No usa Supabase.
- No usa localStorage, sessionStorage ni IndexedDB.
- Todos los cambios viven solamente en memoria.
- Al recargar la página, la sesión y los cambios se reinician.
- Puede subirse directamente a GitHub Pages/Netlify como sitio estático.

## Áreas incluidas
- Landing, acceso y onboarding de 3 pasos.
- Dashboard ejecutivo.
- Ventas, cotizaciones y pedidos.
- Clientes tipo CRM.
- Productos y servicios.
- Inventario, almacenes, kardex, ajustes, transferencias y devoluciones.
- Compras y proveedores.
- Caja y bancos, cierres de caja, cuentas por cobrar y por pagar.
- Tareas, autorizaciones, notificaciones y bitácora.
- Equipo, usuarios, roles, permisos, sesiones y seguridad visual.
- Sucursales.
- Documentos.
- Reportes y exportación CSV.
- Módulos activables/desactivables.
- Planes comerciales de presentación.
- Perfil de empresa y checklist de configuración.
- Tema claro/oscuro.
- Impresión/PDF mediante el navegador.
- Responsive para móvil y escritorio.
- Navegación sin parpadeo blanco.

## Publicación en GitHub Pages
Sube el contenido de esta carpeta a la raíz del repositorio. El workflow incluido en `.github/workflows/pages.yml` está preparado para GitHub Pages.

## Importante
Esta versión es un prototipo completo para aprobación. No debe utilizarse para almacenar información real o sensible. La persistencia y el backend se integrarán después de validar el producto.


## v20 — Alta personalizada
Al crear una empresa, Nexo pregunta por giro, tamaño, oferta, forma de venta, inventario, compras, crédito, finanzas, sucursales, equipo, autorizaciones y prioridades. Con esas respuestas activa módulos y guarda un perfil operativo solo durante la sesión. No usa backend ni persistencia.


## v21 — Configuración automática

El alta de empresa ahora configura Nexo automáticamente según las respuestas del usuario:

- Giro y tipo de operación.
- Productos, servicios o ambos.
- Venta directa, cotizaciones y pedidos.
- Inventario, compras, crédito, finanzas y sucursales.
- Roles base sugeridos según módulos activos.
- Número de sucursales y almacenes.
- Plan sugerido visualmente.
- Dashboard inicial según prioridades.
- Paleta de marca por presets o colores HEX exactos.
- Color principal, acento, sidebar y fondo.
- Estilo visual moderno, premium, minimalista o tecnológico.
- Todo sigue funcionando únicamente en memoria; al recargar se reinicia.

## v22 — Personalización simplificada
- Se eliminaron los campos HEX y selectores manuales de color del onboarding.
- El usuario elige una paleta profesional y Nexo aplica el sistema de color completo automáticamente.
- Los estilos Moderno, Premium, Minimalista y Tecnológico ahora modifican de forma visible radios, sombras, bordes, botones y navegación.
- La personalización avanzada de color puede incorporarse más adelante dentro de Configuración, sin complicar el alta inicial.

## v23 — Crear empresa por niveles
El asistente (chat) SOLO se abre desde "Crear cuenta / Crear empresa" (landing) o "＋ Crear empresa" en el selector de empresa. Nunca al iniciar sesión, abrir la app, elegir una empresa o recargar.
Niveles: Básica (automática), Estándar (guiada) y Personalización máxima (módulos y menú ordenables, tarjetas del dashboard, campos, roles, automatizaciones). La configuración vive en `company.setup` (por empresa). Se edita en Configuración → Personalización de empresa. Persistencia en `localStorage` (`PERSIST` en v23.js).
