const { app, BrowserWindow, dialog } = require('electron');
const fs = require('fs');

let mainWindow = null;
let activeFile = null;

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
  mainWindow.setRepresentedFilename(file);

  mainWindow.webContents.send('file-opened', file, content);
};

exports.showOpenFileDialog = showOpenFileDialog;
