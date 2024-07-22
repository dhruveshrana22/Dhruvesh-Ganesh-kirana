const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');
const os = require('os');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 900,
    webPreferences: {
      nodeIntegration: true // Enable nodeIntegration to use Node.js in renderer process
    }
  });

  mainWindow.loadURL('http://localhost:3000');

  // Open the DevTools if needed
  // mainWindow.webContents.openDevTools();

  // Clear mainWindow reference on close
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow);

// Quit when all windows are closed, except on macOS.
// On macOS, it's common for applications and their menu bar
// to stay active until the user quits explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Handle print-to-pdf message from renderer process
ipcMain.on('print-to-pdf', (event) => {
  const pdfPath = path.join(os.tmpdir(), 'bill.pdf');
  mainWindow.webContents.printToPDF({}, (error, data) => {
    if (error) {
      return console.error(error.message);
    }
    fs.writeFile(pdfPath, data, (error) => {
      if (error) {
        return console.error(error.message);
      }
    });
  });
});
