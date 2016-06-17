const { remote, ipcRenderer } = require('electron');
const { Menu } = remote;
const { openFile } = remote.require('./main.js');

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
