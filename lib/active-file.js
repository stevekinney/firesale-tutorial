const { app, ipcMain } = require('electron');
const fs = require('fs');

class ActiveFile {

  constructor(browserWindow, path = null) {
    this.open(path);
    this.browserWindow = browserWindow;

    ipcMain.on('file-change', (event, content) => {
      this.content = content;
      this.updateWindowTitle();
    });
  }

  get isEdited() {
    return this.content === this.originalContent;
  }

  open(path) {
    let content = '';
    if (path) {
      app.addRecentDocument(path);
      content = fs.readFileSync(path).toString();
    }

    this.path = path || null;
    this.content = content;
    this.originalContent = content;

    this.updateUserInterface();
  }

  updateContent(content) {
    this.content = content;
    this.updateWindowTitle();
  }

  updateWindowTitle() {
    let title = 'Firesale';

    if (this.path) {
      title = `${this.path} - ${title}`;
      this.browserWindow.setRepresentedFilename(this.path);
    }

    if (this.isEdited) {
      title = `${title} (Edited)`;
      this.browserWindow.setDocumentEdited(this.isEdited);
    }

    this.browserWindow.setTitle(title);
  }

  updateUserInterface() {
    this.browserWindow.webContents.send('contents-changed', this.content);
    this.updateWindowTitle();
  }

}

module.exports = ActiveFile;
