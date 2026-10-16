# UbicaMaps1 — MotoTrack

Proyecto de demostración: aplicación web para geolocalización en tiempo real de motorizados.

Estructura: Vite + React + TypeScript + TailwindCSS. El proyecto incluye un servicio demo (src/services/dataService.ts) que simula 40 motorizados y permite ejecutar la app localmente sin backend.

Comandos rápidos:

- Instalar dependencias: `npm install`
- Ejecutar en desarrollo: `npm run dev`
- Construir para producción: `npm run build`
- Servir build local: `npm run preview`

Credenciales demo (en el servicio):
- Admin demo: haru@mototrack.com / admin123
- Motorizado demo: moto_1 / moto001

Descripción breve:
- Panel de administrador: ver motorizados en mapa, filtrar por estado y buscar por placa/nombre.
- Vista motorizado: activación/desactivación de envío de ubicación (cada 2s).

Notas:
- Esta rama inicializa la base del proyecto en modo demo. Para producción, reemplazar `src/services/dataService.ts` por una integración real (Firebase, Supabase, etc.).
