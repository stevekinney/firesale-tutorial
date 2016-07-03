const { remote, ipcRenderer } = require('electron');
const mainProcess = remote.require('./main.js');
const { showOpenFileDialog } = mainProcess;

const $ = require('jquery');
const marked = require('marked');

const $markdownView = $('.raw-markdown');
const $htmlView = $('.rendered-html');

function renderMarkdownToHtml(markdown) {
  const html = marked(markdown, { sanitize: true });
  $htmlView.html(html);
}

function announceFileChange(content) {
  ipcRenderer.send('file-change', content);
}

$markdownView.on('keyup', function () {
  const content = $(this).val();
  announceFileChange(content);
  renderMarkdownToHtml(content);
});

$('#open-file').on('click', function () { // A
  mainProcess.showOpenFileDialog();
});

ipcRenderer.on('file-opened', function (event, file, content) {
  $markdownView.text(content);
  renderMarkdownToHtml(content);
});
