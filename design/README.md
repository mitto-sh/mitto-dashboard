# Handoff: Mitto Dashboard Redesign

## Overview
Rediseño visual completo del dashboard de Mitto (mitto-sh/mitto-dashboard, branch develop): login, lista de proyectos, canvas de servicios (pantalla principal), panel de detalle de servicio y modal "Add service". La arquitectura de información no cambia — solo dirección visual y sistema de diseño, para traducir a Tailwind sobre el código existente.

## About the Design Files
Los archivos `.dc.html` de este bundle son **referencias de diseño en HTML** — prototipos que muestran look & feel e interacciones, NO código de producción. La tarea es **recrear estos diseños en el codebase Next.js 14 + Tailwind existente**, respetando sus patrones (App Router, @dnd-kit/core, componentes en src/components/).

## Fidelity
**High-fidelity.** Colores, tipografía, espaciado e interacciones son finales. Recrear pixel-perfect con Tailwind (tokens abajo).

## Design Tokens (tailwind.config.ts → theme.extend)
```ts
colors: {
  canvas:  '#0A0C10',   // page bg + dot grid base
  surface: '#12151B',   // cards, panel, modal
  raised:  '#151A23',   // nested blocks (status hero)
  chip:    '#1A202B',   // type chips
  border:  { DEFAULT: '#232936', subtle: '#1C212B', chip: '#262D3A' },
  ink:     { DEFAULT: '#E6EAF2', secondary: '#98A2B3', muted: '#5D6878', faint: '#3C4552' },
  accent:  { DEFAULT: '#3DD6C4', hover: '#5EE8D8', ink: '#062B26' },
  status:  {
    live: '#46E08C', building: '#F0B441', failed: '#FF6459',
    queued: '#8A94A6', cancelled: '#5D6878',  // pushing/provisioning = building
  },
},
fontFamily: {
  sans: ['IBM Plex Sans', 'sans-serif'],
  mono: ['IBM Plex Mono', 'monospace'],
},
```
- Fuentes: Google Fonts, IBM Plex Sans 400/500/600 + IBM Plex Mono 400/500/600.
- Mono se usa para TODO valor técnico: slugs, puertos (`:3000`), env vars, statuses, timestamps, SHAs, labels de sección (11px uppercase tracking 0.08em).
- Spacing scale: 4/8/12/16/24/32/48. Radius: 5px chips · 8px botones/inputs · 10-12px cards · 14px modal.
- Dot grid del canvas: `bg-[radial-gradient(circle,#171C24_1px,transparent_1px)] bg-[size:28px_28px]`.

## Typography Scale
- 26/600 título de página (login wordmark: Mono 26/500 "mitto")
- 20/600 headings de sección · 16/600 heading del panel
- 14–14.5 body y nombres de card (600 los nombres) · 13/400 secundario #98A2B3
- Mono 12 valores técnicos · Mono 11 uppercase labels de sección

## Screens

### 1. Login (`Mitto — Login.dc.html` ← src/app/login/page.tsx)
Centrado vertical, fondo canvas con dot grid + glow radial teal inferior (rgba(61,214,196,0.08)). Logo: rombo 22px accent (rotate 45°, radius 5px, glow, pulso lento 4s). Wordmark "mitto" Mono 26/500. Tagline 14 #98A2B3. Botón GitHub: bg #E6EAF2, texto #0A0C10 14/600, radius 8, padding 11×22, hover blanco + translateY(-1px). Error (role=alert): borde rgba(255,100,89,0.35), bg rgba(255,100,89,0.08), texto #FF8A82 13px, dot rojo 6px. Footer Mono 11 #3C4552 "open source · self-hostable".

### 2. Projects (`Mitto — Projects.dc.html` ← src/app/projects/page.tsx)
Header global 56px: rombo accent 11px + "mitto" Mono 13/500, borde inferior #1C212B, avatar 28px a la derecha. Contenido max-w 720 centrado, padding-y 56. H1 20/600 + contador Mono 12 muted ("03"). Form crear: input flex-1 (bg surface, borde #232936, radius 8, padding 10×14, focus borde accent) + botón Create (bg accent, texto #062B26 13/600, radius 8, hover #5EE8D8). Cards de proyecto: filas gap 10, radius 12, borde #1F2531, bg surface, padding 18×20; nombre 14/500 + slug Mono 12 muted apilados (gap 5); icono arrow-right 15px #3C4552 a la derecha; hover: borde rgba(61,214,196,0.4) + bg #151A23. Empty: caja dashed #232936 radius 12, "No projects yet" + línea Mono muted.

### 3. Canvas (`Mitto — Canvas.dc.html` ← Canvas.tsx, ServiceCard.tsx, ServiceDetailPanel.tsx)
Header 56px: logo + "/" + nombre de proyecto (13/500); botón "+ Add service" accent con icono plus 13px.
Canvas: alto calc(100vh-56px), dot grid 28px.

**Service card** (264px, radius 12, bg surface, padding 16×18):
- Fila 1: dot de estado 8px + nombre 14.5/600 (ellipsis) + chip de tipo (Mono 10 uppercase tracking 0.08em, bg #1A202B, borde #262D3A, radius 5, padding 3×7, icono Lucide 11px + texto).
- Fila 2 (mt 14): puerto Mono 12 muted (`:3000` / `no port`) ←→ status Mono 12 en color de estado.
- Estado por TRIPLE señal: dot + palabra coloreada + borde/glow de card:
  - borde: `1px solid status@35%` · glow: `0 0 0 1px status@14%, 0 0 28px status@10%` + `0 8px 24px rgba(0,0,0,0.35)`
  - building/pushing/provisioning: dot con pulso 1.6s (opacity + ring expandiéndose)
  - sin deployments: neutro — borde #232936, sin glow, dot y texto #3C4552 ("no deploys")
- Hover: borde sube a status@60%. Dragging: cursor grabbing, scale(1.03), bg #161B24, borde status@60%, sombra `0 16px 48px rgba(0,0,0,0.6)`, sin transition durante el drag; al soltar, transitions .15s ease.
- Conexiones (opcional, toggle): SVG bajo las cards, bezier horizontal (control ±70px) stroke rgba(61,214,196,0.3) 1.5px, endpoints círculo r3 fill canvas + stroke teal@50%. pointer-events none.
- Footer del canvas: Mono 11 #3C4552 "04 services · drag to arrange".
- Empty canvas: centrado, caja dashed 56px con plus, "No services in this project" + subtítulo mono + botón accent.

**Panel de detalle** (fixed right, 400px, full height, bg #10131A, borde izq #232936, sombra -32px 0 64px rgba(0,0,0,0.45)):
- Header (padding 22×24, borde inferior subtle): dot de estado + nombre 16/600 + botón x (Lucide, 15px, muted→ink hover); metaLine Mono 12 muted con icono de tipo: `web · :3000`.
- Sección DEPLOYMENTS (label Mono 11 uppercase muted): hero card (bg raised, borde #1F2531, radius 10, padding 14×16) con status Mono 13 coloreado + tiempo Mono 11 muted; mensaje de commit 13 ink; SHA Mono 11 muted. Botones: Deploy (accent, icono rocket) + Cancel ghost (borde #232936, texto secondary) solo si status ∈ {queued,building,pushing,provisioning}. Sin deployments: caja dashed "no deployments yet".
- Sección ENVIRONMENT VARIABLES: lista en contenedor borde #1F2531 radius 10; filas padding 10×14 bg surface, divisores subtle: KEY Mono 12/500 #C6CEDB + `•••••••` Mono #3C4552 + x hover rojo. Form agregar: input KEY (40%) + value (flex) mono 12, bg canvas, focus accent; botón + (bg chip).
- Danger zone (borde superior subtle): botón "Delete service" ghost rojo — borde rgba(255,100,89,0.3), texto #FF6459, icono trash-2, hover bg rojo@8%.

### 4. Add Service Modal (`Mitto — Canvas.dc.html` con showModal ← AddServiceModal.tsx)
Overlay rgba(4,6,9,0.7) + backdrop-blur 4px. Card 400px, radius 14, bg surface, borde #232936, sombra 0 24px 64px negro@50%, padding 24. Título 15/600 + slug del proyecto Mono 12 muted. Labels Mono 11 uppercase muted. Inputs bg canvas, radius 8, padding 9×12, focus borde accent; port en Mono. Footer: Cancel (texto secondary) + "Create service" (accent).

## Interactions & Behavior
- Transitions estándar: .15s ease en border-color, background, color, transform. Nada más largo salvo pulsos.
- Drag: sin transition mientras se arrastra; z-index elevado; click sin movimiento (>3px) = seleccionar/abrir panel.
- Focus visible en inputs = borde accent (reemplaza outline).
- Loading: mantener layout, texto mono muted.

## Iconography
Lucide (https://lucide.dev) — stroke 2, currentColor, inline SVG. En `icons/`:
- Tipos: web=globe, worker=settings, cron=clock, static=file-text (11px en chips, 12px en panel)
- Acciones: plus (add), x (close/remove), rocket (Deploy), trash-2 (delete), arrow-right/left (nav), key-round, eye-off (opcionales para env vars)

## Files
- `Mitto — Login.dc.html`, `Mitto — Projects.dc.html`, `Mitto — Canvas.dc.html` (canvas + panel + modal + estados via props), `Mitto — Design System.dc.html` (tokens y especímenes)
- `Current — *.dc.html`: recreación del estado actual, solo referencia comparativa
- `icons/*.svg`: set Lucide
