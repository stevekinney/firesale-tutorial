const { remote, ipcRenderer, Menu } = require('electron');
const mainProcess = remote.require('./main.js');
const { showOpenFileDialog, showSaveFileDialog } = mainProcess;

const markdownContextMenu = Menu.buildFromTemplate([
  { label: 'Open File', click() { openFile(); } },
  { type: 'separator' },
  { label: 'Cut', role: 'cut' },
  { label: 'Copy', role: 'copy' },
  { label: 'Paste', role: 'paste' },
  { label: 'Select All', role: 'selectall' },
]);

const $ = require('jquery');
const marked = require('marked');

const $markdownView = $('.raw-markdown');
const $htmlView = $('.rendered-html');
const $saveFileButton = $('#save-file');

function renderMarkdownToHtml(markdown) {
  const html = marked(markdown, { sanitize: true });
  $htmlView.html(html);
}

$markdownView.on('keyup', () => {
  const content = $(event.target).val();
  renderMarkdownToHtml(content);
});

$('#open-file').on('click', () => { // A
  openFile();
});

ipcRenderer.on('file-opened', (event, file, content) => {
  $markdownView.text(content);
  renderMarkdownToHtml(content);
});

$markdownView.on('contextmenu', (event) => {
  event.preventDefault();
  markdownContextMenu.popup();
});

function triggerFileSaveDialog() {
  const html = $htmlView.html();
  saveFile(html);
}

$saveFileButton.on('click', triggerFileSaveDialog);
