import { app, BrowserWindow, shell } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

// 1. Fix for __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
  const mainWindow = new BrowserWindow({
    // 1. Set dimensions for a 10" screen (Commonly 1024x600 or 1280x800)
    width: 1024, 
    height: 600,
    
    // 2. LOWER the minimums so the window can actually fit on small screens
    minWidth: 800, 
    minHeight: 480,
    
    // 3. Optional: Uncomment 'kiosk: true' for a full-screen, dedicated touch interface
    // kiosk: true, 

    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    icon: path.join(__dirname, '../dist/favicon.ico'),
    title: 'BrightSight - Eye Disease Detection',
    
    // 4. Hide the menu bar to save vertical space on small screens
    autoHideMenuBar: true, 
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173'); // Vite default port is usually 5173, check yours!
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

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