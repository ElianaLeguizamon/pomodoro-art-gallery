# pomodoro-art-gallery

## English

**pomodoro-art-gallery** is a refined desktop Pomodoro experience designed as a calm digital art gallery. It combines focused time management with the progressive reveal of six European classical masterpieces, a continuous lo-fi player, task management, customizable sessions and light/dark themes.

### Features

- Pomodoro timer with focus, break and session controls
- Progressive artwork reveal based on focus-session progress
- Six classical European paintings
- Continuous copyright-free lo-fi audio with play/pause and volume controls
- Task creation, completion and deletion
- Adjustable focus time, break time and session count
- Light and dark interface themes
- Movable timer and lo-fi controls
- Guided in-app tour
- Native desktop window powered by Electron

### Technology Stack

- **Figma** - UI/UX design and interface prototyping
- **Electron** - cross-platform desktop application shell
- **React** - component-based interface
- **TypeScript** - typed application and Electron logic
- **Vite** - fast renderer development and production builds

### Getting Started

#### 1. Clone the repository

```bash
git clone https://github.com/ElianaLeguizamon/pomodoro-art-gallery.git
cd pomodoro-art-gallery
```

#### 2. Install dependencies

```bash
npm install
```

#### 3. Run in development mode

```bash
npm run dev
```

This command starts the Vite renderer and launches the Electron desktop window.

#### 4. Optional build commands

```bash
npm run build
npm run preview
```

### Project Structure

- `src/` - React renderer and Electron TypeScript source code
- `assets/` - paintings, icons and frame textures
- `public/audio/` - bundled lo-fi audio and audio license information
- `index.html` - Vite application entry page
- `package.json` - scripts and project dependencies
- `vite.config.ts` - Vite configuration

---

## Español

**pomodoro-art-gallery** es una experiencia Pomodoro para escritorio, diseñada como una galería de arte digital y tranquila. Combina la gestión del tiempo con la revelación progresiva de seis obras maestras clásicas europeas, un reproductor lo-fi continuo, gestión de tareas, sesiones personalizables y temas claro/oscuro.

### Funcionalidades

- Temporizador Pomodoro con controles de enfoque, descanso y sesiones
- Revelación progresiva de cada obra según el avance de la sesión
- Seis pinturas europeas clásicas
- Audio lo-fi continuo libre de derechos de autor con reproducción/pausa y volumen
- Creación, completado y eliminación de tareas
- Ajuste de tiempo de enfoque, descanso y número de sesiones
- Interfaz en modo claro y oscuro
- Controles móviles para el temporizador y el reproductor lo-fi
- Recorrido guiado dentro de la aplicación
- Ventana nativa de escritorio desarrollada con Electron

### Stack tecnológico

- **Figma** - diseño UI/UX y prototipado de interfaz
- **Electron** - entorno de aplicación de escritorio multiplataforma
- **React** - interfaz basada en componentes
- **TypeScript** - lógica tipada de la aplicación y Electron
- **Vite** - desarrollo rápido y compilación del renderer

### Primeros pasos

#### 1. Clonar el repositorio

```bash
git clone https://github.com/ElianaLeguizamon/pomodoro-art-gallery.git
cd pomodoro-art-gallery
```

#### 2. Instalar las dependencias

```bash
npm install
```

#### 3. Ejecutar en modo desarrollo

```bash
npm run dev
```

Este comando inicia el renderer de Vite y abre la ventana de escritorio de Electron.

#### 4. Comandos opcionales de compilación

```bash
npm run build
npm run preview
```

### Estructura del proyecto

- `src/` - código fuente React del renderer y TypeScript de Electron
- `assets/` - pinturas, iconos y texturas del marco
- `public/audio/` - archivo lo-fi incluido e información de licencia
- `index.html` - página de entrada de la aplicación Vite
- `package.json` - scripts y dependencias del proyecto
- `vite.config.ts` - configuración de Vite

## License

The application source is private or subject to the repository license when specified. Bundled lo-fi audio is provided under CC0 1.0 Universal and includes attribution information in `public/audio/LICENSE.txt`.
