const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const ActiveFile = require('./active-file');

let mainWindow = exports.mainWindow = null;
let activeFile = exports.activeFile = null;

app.on('ready', function () {
  mainWindow = new BrowserWindow();

  mainWindow.loadURL(`file://${__dirname}/index.html`);

  activeFile = new ActiveFile(mainWindow);

  mainWindow.on('closed', function () {
    mainWindow = null;
  });

  app.on('open-file', (event, file) => {
    activeFile.open(file);
  });
});


ipcMain.on('file-drop', (event, file) => {
  activeFile.open(file);
});

const showOpenFileDialog = function () {
  const files = dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Text Files', extensions: ['txt'] },
      { name: 'Markdown Files', extensions: ['md', 'markdown'] }
    ]
  });

  if (files) { activeFile.open(files[0]); }
};


exports.showOpenFileDialog = showOpenFileDialog;
exports.showSaveFileDialog = showOpenFileDialog;
