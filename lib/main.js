const { app, BrowserWindow, dialog, Menu } = require('electron');
const applicationMenu = require('./application-menu');
const fs = require('fs');

let mainWindow = null;

app.on('ready', () => {
  mainWindow = new BrowserWindow();

  mainWindow.loadURL(`file://${__dirname}/index.html`);

  mainWindow.webContents.openDevTools();

  Menu.setApplicationMenu(applicationMenu);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
});

const openFile = function () {
  const files = dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Text Files', extensions: ['txt'] },
      { name: 'Markdown Files', extensions: ['md', 'markdown'] }
    ],
  });

  if (!files) { return; }

  const file = files[0];
  const content = fs.readFileSync(file).toString();

  mainWindow.webContents.send('file-opened', file, content);
};

const saveFile = (content) => {
  const fileName = dialog.showSaveDialog(mainWindow, {
    title: 'Save HTML Output',
    defaultPath: app.getPath('documents'),
    filters: [
      { name: 'HTML Files', extensions: ['html'] }
    ]
  });

  if (!fileName) { return; }

  fs.writeFileSync(fileName, content);
};

exports.openFile = openFile;
exports.saveFile = saveFile;

const paths = ['home', 'desktop', 'documents', 'downloads', 'pictures', 'music', 'videos', 'temp', 'exe', 'appData', 'userData'];

for (let p of paths) {
  console.log(p, app.getPath(p));
}
