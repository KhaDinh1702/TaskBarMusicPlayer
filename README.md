# AuraMusic Player (Desktop)

A minimalist, high-performance desktop music player featuring multi-source link resolution (SoundCloud, YouTube, Spotify) and a frameless, translucent Taskbar widget.

---

## 1. Key Features

### Multi-Source Link Resolver
- SoundCloud: Directly streams tracks and playlists via HLS/MP3 stream endpoints.
- YouTube / YouTube Music: Automatically extracts high-bitrate audio streams (Opus/AAC).
- Spotify: Resolves track/album metadata (title, artist, album artwork) and dynamically matches the best audio stream source.
- Unified input: Paste any track or playlist link directly into the top search bar.

### Transparent Taskbar Floating Widget
- Compact frameless overlay with translucent glass styling, pinned directly above the Windows taskbar.
- Always-on-top mode displaying currently playing track information, rotating vinyl visual, and real-time audio progress.
- Quick hotkey toggle between full dashboard and minimal taskbar widget.

### Ultra-Lightweight Preact Core (~3KB Runtime)
- Built with Preact instead of standard React: 90% bundle size reduction and minimal background RAM consumption.
- Designed with Tailwind CSS following a curated warm gray-white monochrome palette (#F2EFE9, #E9E5DC, #BFBFBD, #8C8C8C, #262626).

### Real-Time Audio Visualizer
- Powered by Web Audio API (AnalyserNode) to deliver dynamic frequency spectrum bars.

### Portable Single-File Executable
- Packaged as a standalone portable Windows binary (AuraMusic-Portable.exe).
- Requires zero installation, no administrative privileges, and no external runtime dependencies.

---

## 2. Design System & Color Palette

The interface is built upon a warm gray-white architectural color scheme:

- Base Canvas: #F2EFE9 (Soft warm off-white)
- Card & Panel Surface: #E9E5DC (Warm sandstone gray)
- Structural Borders & Dividers: #BFBFBD (Muted silver gray)
- Secondary Elements & Muted Text: #8C8C8C (Mid-tone slate gray)
- Primary Contrast & Active Controls: #262626 (Deep charcoal black)

---

## 3. Technology Stack

- Desktop Runtime: Electron
- Frontend Architecture: Preact (React Hooks compatible, ~3KB footprint)
- Build System: Vite
- Styling Framework: Tailwind CSS
- Iconography: Lucide Icons
- Audio Engine: HTML5 Audio with Web Audio API
- Packaging: electron-builder

---

## 4. Project Structure

```
musicPlayer/
├── src/
│   ├── main/                    # Electron Main Process (Node.js runtime)
│   │   ├── index.ts             # App lifecycle, IPC, and global shortcuts
│   │   ├── windows.ts           # Window lifecycle (Main & Taskbar Widget)
│   │   └── resolver/            # Multi-source URL scrapers & stream extractors
│   │       ├── soundcloud.ts    # SoundCloud API resolver
│   │       ├── youtube.ts       # YouTube audio extractor
│   │       └── spotify.ts       # Spotify metadata resolver & stream matcher
│   ├── preload/                 # Secure IPC context bridges
│   │   └── index.ts
│   └── renderer/                # Preact UI Layer
│       ├── components/
│       │   ├── Header.tsx       # Search bar, URL resolver, and window controls
│       │   ├── Player.tsx       # Playback controls, seekbar, and volume
│       │   ├── Playlist.tsx     # Queue manager with source tags
│       │   ├── TaskbarWidget.tsx# Floating translucent widget for Windows taskbar
│       │   └── Visualizer.tsx   # Web Audio API spectrum canvas
│       ├── hooks/
│       │   ├── useAudio.ts      # Audio playback and Web Audio context hook
│       │   └── usePlaylist.ts   # Persistent local playlist storage hook
│       ├── App.tsx              # Root component & routing
│       ├── index.css            # Custom design tokens and utility classes
│       └── main.tsx             # Entry point
├── electron-builder.json        # Portable executable packaging configuration
├── tailwind.config.js
├── vite.config.ts
├── package.json
└── README.md
```

---

## 5. Development & Build Instructions

### Install Dependencies
```bash
npm install
```

### Start Development Server
```bash
npm run dev
```

### Build Portable Executable (.exe)
```bash
npm run build:portable
```
The resulting executable will be available at `dist-release/AuraMusic-Portable-1.0.0.exe`.

---

## 6. Default Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| Space | Play / Pause |
| Ctrl + Right | Next track |
| Ctrl + Left | Previous track |
| Ctrl + M | Toggle between Full Dashboard and Taskbar Widget |
| Ctrl + Shift + V | Paste link directly into queue |

---

## 7. License
Developed for personal research and educational purposes.
