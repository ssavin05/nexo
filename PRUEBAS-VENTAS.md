# CIA — Pruebas iniciales del ciclo de ventas

Fecha: 13 de octubre de 2026

## Implementado en esta iteración

- Formulario de venta con selección de cliente, una o más partidas, cantidades, importe recibido y método de pago.
- Cálculo del total y saldo pendiente en el formulario.
- Validación de cliente, partidas, cantidad, pago y stock suficiente antes de registrar.
- Al confirmar: folio, detalle de productos, descuento de inventario, movimiento de inventario, pago (si existe), transacción de caja, saldo del cliente, métricas locales y bitácora.
- Estado comercial separado del estado de pago (`confirmed` y `paid`/`partial`/`pending`).
- Persistencia de la base de datos del prototipo en `localStorage` para que sobreviva a recargar la misma página en el mismo navegador.

## Pruebas ejecutadas

1. Venta de 3 unidades a $100, stock inicial 10 y pago de $100: pasa; total $300, stock final 7, saldo $200 y se crean registros locales de venta, cobro y movimiento.
2. Venta de 99 unidades con stock disponible 7: pasa; se rechaza y no se modifica el stock ni se crea otra venta.
3. Sintaxis de los 17 archivos JavaScript: pasa con `node --check`.

## Limitaciones conocidas

- Sigue siendo un prototipo local; `localStorage` no es una base de datos empresarial ni permite sincronización segura multiusuario.
- No se ha implementado aún API Node.js/PostgreSQL, transacciones reales de base de datos, control de concurrencia ni idempotencia del servidor.
- No se ha implementado cálculo de impuestos, descuentos, devoluciones, cancelación de ventas ni reembolsos.
- El entorno de esta revisión no tiene navegador automatizado disponible, por lo que falta comprobar visualmente el modal en escritorio y móvil.
- Los registros de demostración ya existentes no se migran ni se normalizan automáticamente; hacer pruebas en un espacio de muestra.
- No usar este prototipo para registrar ventas reales o datos sensibles.
