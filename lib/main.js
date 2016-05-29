const { app, BrowserWindow, dialog, Menu, MenuItem } = require('electron');
const fs = require('fs');

let mainWindow = null;

app.on('ready', () => {
  mainWindow = new BrowserWindow();

  mainWindow.loadURL(`file://${__dirname}/index.html`);

  // mainWindow.webContents.openDevTools();

  const menu = new Menu();
  menu.append(new MenuItem({ label: 'First Item' }));
  menu.append(new MenuItem({ label: 'Second Item' }));
  menu.append(new MenuItem({ type: 'separator' }));
  menu.append(new MenuItem({ label: 'Third Item' }));

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

exports.openFile = openFile;
