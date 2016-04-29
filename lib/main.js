const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const dialog = electron.dialog;

app.on('ready', function () {
  mainWindow = new BrowserWindow();

  mainWindow.loadURL('file://' + __dirname + '/index.html');

  openFile();

  mainWindow.webContents.openDevTools();

  mainWindow.on('closed', function() {
    mainWindow = null;
  });
});

const openFile = function () {
  var files = dialog.showOpenDialog({ // A
    properties: ['openFile'] // B
  });

  if (!files) { return; } // C

  console.log(files); // D
};
