# 🦅 Falcon Mensajería Femenina — Tablero de Pedidos

**Parcial Práctico C3 — Diseño Web Avanzado**  
**Unidades Tecnológicas de Santander (UTS)**  
**Docente:** Eduwin Andrés Flórez Orejuela

---

## 🔗 App desplegada

[Falcon Mensajería Femenina](https://falcon-mensajeria.netlify.app/)

---

## Integrantes del grupo
- Juan Arias
- Cristhian Echavarria
- Miguel Moncada
- Jaider Vezga

---

## Descripción del proyecto

**Falcon Mensajería Femenina** es un servicio de mensajería con enfoque en clientas de Bucaramanga que buscan confianza, discreción y puntualidad en sus entregas. La interfaz construida corresponde a un **tablero interno de operaciones** que permite a las coordinadoras del negocio hacer seguimiento en tiempo real del estado de cada pedido a lo largo de su ciclo de vida.

### Usuario real
Coordinadoras de despacho de Falcon Mensajería que deben monitorear y actualizar el estado de múltiples pedidos simultáneamente durante la jornada.

### Problema que resuelve
Sin esta herramienta, el seguimiento se hace por WhatsApp o cuadernos físicos, lo que genera errores, demoras y pérdida de información. El tablero digital centraliza el estado de todos los pedidos en una sola vista.

---

## Componente interactivo — Nivel 2 + Nivel 3

### Tablero Kanban con drag & drop (Nivel 2)

La interfaz implementa un **tablero de pedidos con arrastrar y soltar** entre tres columnas de estado:

```
[ Recibido ] ──drag──▶ [ En ruta ] ──drag──▶ [ Entregado ]
```

**Cómo funciona el estado:**
- Cada pedido es un objeto en el estado de React (`useState`), organizado en un diccionario con tres claves: `recibido`, `en_ruta`, `entregado`.
- Al arrastrar una tarjeta (`draggable` + eventos `onDragStart`, `onDrop`), se actualiza el estado eliminando el pedido de la columna origen y agregándolo a la columna destino, sin recargar la página.
- El pedido **permanece donde se soltó** hasta que se mueva nuevamente.

### Sincronización en múltiples puntos (Nivel 3)

Cuando se mueve un pedido, la interfaz refleja el cambio **simultáneamente en tres lugares**:
1. La tarjeta desaparece de la columna origen y aparece en la columna destino.
2. Los **contadores del encabezado** (Recibido / En ruta / Entregado) se actualizan en vivo.
3. El **indicador de progreso** en la barra de acciones muestra el avance global.

Esto corresponde al criterio de "sincronización en varios puntos" del Nivel 3 de la rúbrica.

### Funcionalidades adicionales
- Registro de nuevos pedidos desde un modal (se agregan a la columna "Recibido").
- Indicador visual de columna objetivo durante el arrastre.
- Etiqueta de prioridad URGENTE visible en las tarjetas.

---

## Stack tecnológico

| Tecnología | Versión | Rol |
|------------|---------|-----|
| React | 18.x | Framework principal |
| JavaScript (ES2022) | — | Lógica del componente |
| HTML5 Drag & Drop API | nativo | Interacción de arrastre |
| CSS-in-JS (objetos de estilo) | — | Estilos sin dependencias extra |
| Google Fonts | — | Tipografía (Inter) |

> **Nota:** No se usan librerías externas de drag & drop (como `react-beautiful-dnd`) deliberadamente, para demostrar comprensión del mecanismo nativo y facilitar la explicación en sustentación.

---

## Estructura del proyecto

```
falcon-mensajeria/
├── public/
│   └── index.html
├── src/
│   ├── index.js       ← Punto de entrada React
│   └── App.jsx        ← Componente principal (tablero + estado + drag & drop)
├── package.json
└── README.md
```

---

## Instrucciones de instalación y ejecución

```bash
# 1. Clonar el repositorio
git clone https://github.com/TU_USUARIO/falcon-mensajeria.git
cd falcon-mensajeria

# 2. Instalar dependencias
npm install

# 3. Ejecutar en desarrollo
npm start
# Abre http://localhost:3000
```

### Despliegue en Netlify
1. Crear cuenta en [netlify.com](https://netlify.com)
2. Clic en **"Add new site"** → **"Import an existing project"**
3. Conectar con GitHub y seleccionar el repositorio
4. Configurar:
   - **Build command:** `npm install && node node_modules/react-scripts/bin/react-scripts.js build`
   - **Publish directory:** `build`
5. Clic en **"Deploy site"**

---

## Análisis del referente — Trello

### Referente elegido
**Trello** — [https://trello.com](https://trello.com)  
Framework verificado con **Wappalyzer**: React (confirmado).

### Descripción de la interfaz
Trello es una herramienta de gestión de proyectos basada en tableros Kanban. Su interfaz principal consiste en un espacio horizontal de columnas (llamadas "listas"), cada una conteniendo tarjetas que representan tareas o ítems de trabajo. El usuario puede crear, editar, mover y organizar estas tarjetas libremente.

### Patrón interactivo: arrastre de tarjetas entre listas

**¿Qué pasa con el estado?**  
Trello mantiene el estado del tablero en memoria (cliente) y en sincronización con su backend. Cada tarjeta tiene un `id` único y una referencia a la lista (`listId`) a la que pertenece, junto con una posición (`pos`) que define el orden dentro de esa lista.

**¿Qué se actualiza al hacer drag & drop?**
1. **Visualmente (inmediato):** la tarjeta se "sigue" al cursor durante el arrastre usando un elemento fantasma (ghost element) con posición absoluta.
2. **Estado local (React):** al soltar la tarjeta, el estado de React se actualiza: la tarjeta se elimina de la lista origen y se inserta en la lista destino en la posición correcta.
3. **Contadores:** el número de tarjetas en cada lista se recalcula y se muestra en el encabezado de cada columna.
4. **Backend (optimista):** Trello aplica **UI optimista** — el cambio se muestra de inmediato en el cliente *antes* de recibir confirmación del servidor. Si el servidor falla, el estado revierte. Esto es lo que le da la sensación de velocidad instantánea.

**¿Qué NO se recarga?**  
Absolutamente nada. No hay navegación de página, no hay `window.location.reload()`. Todo ocurre dentro del mismo árbol de componentes React mediante actualizaciones de estado.

**Implementación técnica inferida:**  
Trello usa la [HTML5 Drag and Drop API](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API) combinada con lógica de React. Los eventos clave son `dragstart`, `dragover` (con `preventDefault()` para permitir el drop), `drop` y `dragend`. El estado global probablemente se gestiona con Redux o Context API para que múltiples componentes puedan reaccionar al cambio de posición de una tarjeta.

**Diferencia con nuestra implementación:**  
Nuestro tablero usa el mismo mecanismo nativo de la API, pero sin UI optimista (al ser un prototipo sin backend, todos los cambios son locales e instantáneos). La sincronización en múltiples puntos (contadores + columnas) sí está implementada.

---

## Enlace al video de sustentación

https://youtu.be/GQNJghw9yxo?si=lw6ruxioH797JnLK


---

## Licencia
Proyecto académico — UTS 2026