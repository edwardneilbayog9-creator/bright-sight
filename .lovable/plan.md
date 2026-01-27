
# Plan: Migrate BrightSight to Electron Desktop Application

## Overview

This plan will set up Electron for desktop deployment while maintaining web compatibility. We'll use **HashRouter** for proper file:// protocol routing in Electron and configure build scripts for Windows, macOS, and Linux.

---

## Architecture

```text
┌─────────────────────────────────────────────────────┐
│                  BrightSight App                    │
├─────────────────────────────────────────────────────┤
│  React Frontend (Vite build)                        │
│    └── HashRouter (works with file:// protocol)    │
├─────────────────────────────────────────────────────┤
│  Electron Main Process                              │
│    ├── electron/main.js (window management)         │
│    └── electron/preload.js (security bridge)        │
├─────────────────────────────────────────────────────┤
│  Database Layer                                     │
│    ├── sql.js (current - web/localStorage)          │
│    └── better-sqlite3 (future - native file DB)     │
└─────────────────────────────────────────────────────┘
```

---

## Part 1: Install Electron Dependencies

### New packages to install:

```bash
npm install --save-dev electron electron-builder concurrently wait-on cross-env
```

| Package | Purpose |
|---------|---------|
| `electron` | Desktop application framework |
| `electron-builder` | Package and distribute for Win/Mac/Linux |
| `concurrently` | Run multiple npm scripts simultaneously |
| `wait-on` | Wait for Vite dev server before launching Electron |
| `cross-env` | Cross-platform environment variables |

---

## Part 2: Create Electron Configuration Files

### File: `electron/main.js`

Main process that creates the application window:

```javascript
const { app, BrowserWindow, shell } = require('electron');
const path = require('path');

// Handle creating/removing shortcuts on Windows when installing/uninstalling
if (require('electron-squirrel-startup')) app.quit();

const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    icon: path.join(__dirname, '../public/favicon.ico'),
    title: 'BrightSight - Eye Disease Detection',
    autoHideMenuBar: true,
  });

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:8080');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Open external links in browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
```

### File: `electron/preload.js`

Security bridge for future IPC communication:

```javascript
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods for renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  isElectron: true,
  // Add more APIs as needed for better-sqlite3 integration
});
```

---

## Part 3: Update App.tsx - Switch to HashRouter

Change `BrowserRouter` to `HashRouter` for Electron compatibility:

```tsx
// Before
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// After  
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";

// In component (line 133):
// Before: <BrowserRouter>
// After:  <HashRouter>
```

**Why HashRouter?**
- Electron loads files using `file://` protocol
- BrowserRouter requires a web server to handle routes
- HashRouter uses URL hash (`#/dashboard`) which works locally

---

## Part 4: Update Vite Configuration

### File: `vite.config.ts`

Add `base` configuration for Electron production builds:

```typescript
export default defineConfig(({ mode }) => ({
  // Add this for Electron - use relative paths in production
  base: mode === 'production' ? './' : '/',
  
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  // ... rest of config
}));
```

---

## Part 5: Update package.json

### Add Electron configuration and build scripts:

```json
{
  "name": "brightsight",
  "version": "1.0.0",
  "description": "AI-powered eye disease detection and pre-diagnosis system",
  "main": "electron/main.js",
  "author": "BrightSight Team",
  "license": "MIT",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:dev": "vite build --mode development",
    "lint": "eslint .",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    
    "electron:dev": "concurrently \"npm run dev\" \"wait-on http://localhost:8080 && cross-env NODE_ENV=development electron .\"",
    "electron:build": "npm run build && electron-builder",
    "electron:build:win": "npm run build && electron-builder --win",
    "electron:build:mac": "npm run build && electron-builder --mac",
    "electron:build:linux": "npm run build && electron-builder --linux",
    "electron:build:all": "npm run build && electron-builder --win --mac --linux"
  },
  "build": {
    "appId": "com.brightsight.app",
    "productName": "BrightSight",
    "copyright": "Copyright © 2025 BrightSight",
    "directories": {
      "output": "release",
      "buildResources": "build"
    },
    "files": [
      "dist/**/*",
      "electron/**/*",
      "public/**/*"
    ],
    "win": {
      "target": ["nsis", "portable"],
      "icon": "public/favicon.ico"
    },
    "mac": {
      "target": ["dmg", "zip"],
      "icon": "public/favicon.ico",
      "category": "public.app-category.medical"
    },
    "linux": {
      "target": ["AppImage", "deb"],
      "icon": "public/favicon.ico",
      "category": "Science"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "installerIcon": "public/favicon.ico",
      "uninstallerIcon": "public/favicon.ico"
    }
  }
}
```

---

## Part 6: Create Build Resources Directory

### File: `build/.gitkeep`

Create placeholder for build resources (icons, certificates):

```text
# Build resources directory
# Place platform-specific icons here:
# - icon.ico (Windows)
# - icon.icns (macOS)  
# - icon.png (Linux - 512x512)
```

---

## Summary of Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `electron/main.js` | Create | Electron main process |
| `electron/preload.js` | Create | Security bridge |
| `src/App.tsx` | Modify | BrowserRouter → HashRouter |
| `vite.config.ts` | Modify | Add `base: './'` for production |
| `package.json` | Modify | Add Electron scripts and build config |
| `build/.gitkeep` | Create | Build resources placeholder |

---

## Usage Guide After Implementation

### Development Commands

```bash
# Web development (current)
npm run dev

# Electron development (opens desktop window)
npm run electron:dev
```

### Build Commands

```bash
# Build for Windows (creates .exe installer)
npm run electron:build:win

# Build for macOS (creates .dmg)
npm run electron:build:mac

# Build for Linux (creates .AppImage and .deb)
npm run electron:build:linux

# Build for all platforms
npm run electron:build:all
```

### Output Location

Built applications will be in the `release/` directory:
- Windows: `release/BrightSight Setup 1.0.0.exe`
- macOS: `release/BrightSight-1.0.0.dmg`
- Linux: `release/BrightSight-1.0.0.AppImage`

---

## Future Enhancement: Native SQLite (better-sqlite3)

The database interface (`IDatabaseService`) was designed for this migration. After Electron is working, you can:

1. Install `better-sqlite3` for native file-based database
2. Create `BetterSqliteService` implementing the same interface
3. Store database in Electron's `userData` directory
4. Auto-detect environment and use appropriate service

This would give you:
- Larger database capacity (no localStorage limits)
- Better performance for complex queries
- Proper file-based persistence

