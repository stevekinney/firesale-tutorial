const { app, ipcMain, dialog } = require('electron');
const fs = require('fs');
const path = require('path');
const marked = require('marked');

class ActiveFile {

  constructor(browserWindow, filePath = null) {
    this.browserWindow = browserWindow;
    this.open(filePath);

    ipcMain.on('file-change', (event, content) => {
      this.content = content;
      this.updateWindowTitle();
    });
  }

  get fileName() {
    return path.basename(this.filePath);
  }

  get fileDirectory() {
    return path.dirname(this.filePath);
  }

  get isEdited() {
    return this.content !== this.originalContent;
  }

  open(filePath) {
    let content = '';
    if (filePath) {
      app.addRecentDocument(filePath);
      content = fs.readFileSync(filePath).toString();
    }

    this.filePath = filePath || null;
    this.content = content;
    this.originalContent = content;

    this.watch();
    this.updateUserInterface();
  }

  saveMarkdown() {
    if (!this.filePath) {
      this.filePath = dialog.showSaveDialog(this.browserWindow, {
        title: 'Save Markdown',
        defaultPath: app.getfilePath('documents'),
        filters: [
          { name: 'Markdown Files', extensions: ['md', 'markdown'] }
        ]
      });
    }

    this.save(this.content, this.filePath);
  }

  saveHtml() {
    const html = marked(this.content, { sanitize: true });

    const filePath = dialog.showSaveDialog(this.browserWindow, {
      title: 'Save HTML',
      defaultPath: app.getfilePath('documents'),
      filters: [
        { name: 'HTML Files', extensions: ['html'] }
      ]
    });

    this.save(html, filePath);
  }

  save(content, filePath = this.filePath) {
    fs.writeFileSync(filePath, content);
    this.originalContent = content;
    this.updateWindowTitle();
  }

  revert() {
    this.updateContent(this.originalContent);
  }

  reload() {
    this.open(this.filePath);
  }

  updateContent(content) {
    this.content = content;
    this.updateWindowTitle();
    return this;
  }

  updateWindowTitle() {
    let title = 'Firesale';

    if (this.filePath) {
      title = `${this.fileName} - ${title}`;
      this.browserWindow.setRepresentedFilename(this.filePath);
    }

    if (this.isEdited) { title = `${title} (Edited)`; }

    this.browserWindow.webContents.send('update-state', this.isEdited);
    this.browserWindow.setDocumentEdited(this.isEdited);
    this.browserWindow.setTitle(title);

    return this;
  }

  updateUserInterface() {
    this.browserWindow.webContents.send('file-change', this);
    this.updateWindowTitle();
    return this;
  }

  watch() {
    this.stopWatching();
    if (!this.filePath) { return this; }

    this.watcher = fs.watch(this.filePath, (event) => {
      if (event === 'change') { this.reload(); }
    });

    return this;
  }

  stopWatching() {
    if (this.watcher) { this.watcher.close(); }
    return this;
  }

}

module.exports = ActiveFile;
