const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const fs = require('fs');

let mainWindow = null;
let activeFile = null;
let activeFileContent = '';
let activeFileHasChanged = false;

app.on('ready', function () {
  mainWindow = new BrowserWindow();

  mainWindow.loadURL(`file://${__dirname}/index.html`);

  mainWindow.webContents.openDevTools();

  mainWindow.on('closed', function () {
    mainWindow = null;
  });

  app.on('open-file', (event, file) => {
    openFile(file);
  });
});

ipcMain.on('file-change', (event, content) => {
  activeFileHasChanged = compareContents(content);
  mainWindow.setDocumentEdited(activeFileHasChanged);
  event.sender.send('file-unsaved', activeFileHasChanged);
});

ipcMain.on('file-drop', (event, file) => {
  openFile(file);
});

const showOpenFileDialog = function () {
  const files = dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Text Files', extensions: ['txt'] },
      { name: 'Markdown Files', extensions: ['md', 'markdown'] }
    ]
  });

  if (files) { openFile(files[0]); }
};

const openFile = function (file) {
  const content = fs.readFileSync(file).toString();

  app.addRecentDocument(file);
  activeFile = file;
  activeFileContent = content;
  mainWindow.setRepresentedFilename(file);

  mainWindow.webContents.send('file-opened', file, content);
};

const compareContents = function (content) {
  return content !== activeFileContent;
};

exports.showOpenFileDialog = showOpenFileDialog;
